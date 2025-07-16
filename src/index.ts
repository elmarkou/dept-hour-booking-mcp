import http from "http";
import { URL } from "url";


const {
  DEPT_CLIENT_ID,
  DEPT_CLIENT_SECRET,
  DEPT_API_BASE_URL = "https://deptapps-api.deptagency.com/public/api/v1",
  DEPT_TOKEN_URL = "https://deptapps-api.deptagency.com/public/api/token",
  DEPT_EMPLOYEE_ID,
  DEPT_CORPORATION_ID,
  DEPT_DEFAULT_ACTIVITY_ID, 
  DEPT_DEFAULT_PROJECT_ID,
  DEPT_DEFAULT_COMPANY_ID,
  DEPT_DEFAULT_BUDGET_ID,
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_SECRET,
  DOCKER_CONTAINER,
} = process.env;

// When asked to book a holiday or vacation, use DEPT_DEFAULT_ACTIVITY_ID=85 and DEPT_DEFAULT_PROJECT_ID=87
// Default description for holidays is "Holiday" or "Vacation"
// Default description for sick days is "Sick leave" or "Sick day"
// Default description for other time off is "Time off" or "Leave"


// Callback endpoint for Google OAuth
const OAUTH_CALLBACK_PATH = "/oauth2callback";
let latestGoogleIdToken: string | null = null;

function startOAuthCallbackServer(port: number = 3005) {
  const server = http.createServer(async (req, res) => {
    if (req.url && req.url.startsWith(OAUTH_CALLBACK_PATH)) {
      // Use 0.0.0.0 for listening, but construct URLs for logs and redirects using the host header or fallback to localhost
      const host = req.headers.host || `localhost:${port}`;
      const urlObj = new URL(req.url, `http://${host}`);
      const code = urlObj.searchParams.get("code");
      // const state = urlObj.searchParams.get("state"); // Not used
      if (code) {
        try {
          // Use the host header for redirectUri, fallback to localhost
          const redirectUri = `http://${host}${OAUTH_CALLBACK_PATH}`;
          const idToken = await exchangeCodeForIdToken(code, redirectUri);
          latestGoogleIdToken = idToken;
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`<h2>Google authentication successful!</h2><p>You may close this window.</p>`);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end(`<h2>Google authentication failed.</h2><pre>${err instanceof Error ? err.message : String(err)}</pre>`);
        }
      } else {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h2>Missing code parameter.</h2>`);
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.listen(port, '0.0.0.0', () => {
    console.error(`OAuth callback server listening on http://0.0.0.0:${port}${OAUTH_CALLBACK_PATH} (accessible via http://localhost:${port}${OAUTH_CALLBACK_PATH} on host)`);
  });
}

// Tool schemas for Google SSO
const GoogleOAuthUrlSchema = z.object({
  redirectUri: z.string().url(),
});

const GoogleOAuthCodeSchema = z.object({
  code: z.string(),
  redirectUri: z.string().url(),
});

function getGoogleOAuthUrl(redirectUri: string): string {
  if (!GOOGLE_AUTH_CLIENT_ID) throw new Error("Missing GOOGLE_AUTH_CLIENT_ID");
  const base = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: GOOGLE_AUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `${base}?${params.toString()}`;
}

async function exchangeCodeForIdToken(code: string, redirectUri: string): Promise<string> {
  console.log(process.env)
  if (!GOOGLE_AUTH_CLIENT_ID) throw new Error("Missing GOOGLE_AUTH_CLIENT_ID");
  if (!GOOGLE_AUTH_CLIENT_SECRET) throw new Error("Missing GOOGLE_AUTH_CLIENT_SECRET");
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_AUTH_CLIENT_ID,
    client_secret: GOOGLE_AUTH_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  if (!data.id_token) throw new Error("No id_token returned from Google");
  return data.id_token;
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { URLSearchParams } from "url";

// Only load .env file when not running in Docker
// Docker Compose provides environment variables directly
if (!DOCKER_CONTAINER) {
  // Suppress dotenv output by temporarily redirecting console output
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  console.log = () => {};
  console.error = () => {};
  
  dotenv.config({ debug: false, override: false });
  
  // Restore console output
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

// Types for better type safety
interface Budget {
  id: string;
  name?: string;
  [key: string]: unknown;
}

interface BookedHour {
  id: string;
  date: string;
  hours: string | number;
  description?: string;
  projectName?: string;
  budgetName?: string;
  [key: string]: unknown;
}

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  client_id: string;
  ".issued": string;
  ".expires": string;
}

// Token management
let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let tokenExpiresAt: Date | null = null;

// Function to get initial access token using Google OAuth
async function getInitialAccessToken(): Promise<TokenResponse> {
  // Use latestGoogleIdToken if available

  const googleIdToken = latestGoogleIdToken;
  if (!DEPT_CLIENT_ID || !DEPT_CLIENT_SECRET) {
    const missing: string[] = [];
    if (!DEPT_CLIENT_ID) missing.push("DEPT_CLIENT_ID");
    if (!DEPT_CLIENT_SECRET) missing.push("DEPT_CLIENT_SECRET");
    throw new Error(`Missing required credentials: ${missing.join(", ")}`);
  }
  if (!googleIdToken) {
    // Generate Google OAuth URL and throw a custom error to prompt authentication
    const redirectUri = "http://127.0.0.1:3005/oauth2callback";
    const oauthUrl = getGoogleOAuthUrl(redirectUri);
    throw {
      isGoogleAuthPrompt: true,
      message: `❌ Google ID token is missing.\n\nTo authorize, please visit the following URL in your browser, sign in, and paste the resulting code here:\n\n${oauthUrl}\n\nAfter authorization, use the code to obtain a new Google ID token.`,
      oauthUrl,
    };
  }

  const params = new URLSearchParams({
    client_id: DEPT_CLIENT_ID,
    client_secret: DEPT_CLIENT_SECRET,
    grant_type: 'google',
    google_id_token: googleIdToken
  });

  try {
    const response = await fetch(DEPT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If authentication failed, prompt for Google authorization
      if (errorText.toLowerCase().includes("initial google authentication failed") || errorText.toLowerCase().includes("invalid token") || errorText.toLowerCase().includes("google_id_token")) {
        const redirectUri = "http://127.0.0.1:3005/oauth2callback";
        const oauthUrl = getGoogleOAuthUrl(redirectUri);
        // Throw a custom error object that can be handled by all tool calls
        throw {
          isGoogleAuthPrompt: true,
          message: `❌ Google ID token is invalid or expired.\n\nTo authorize, please visit the following URL in your browser, sign in, and paste the resulting code here:\n\n${oauthUrl}\n\nAfter authorization, use the code to obtain a new Google ID token.`,
          oauthUrl,
        };
      }
      throw new Error(`Initial Google authentication failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData = await response.json() as TokenResponse;
    // Update token variables
    currentAccessToken = tokenData.access_token;
    currentRefreshToken = tokenData.refresh_token;
    tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

    console.error(`Google authentication successful. Expires at: ${tokenExpiresAt.toISOString()}`);
    return tokenData;
  } catch (error) {
    // If error is Google auth prompt, rethrow for higher-level handling
    if (error && typeof error === 'object' && (error as any).isGoogleAuthPrompt) {
      throw error;
    }
    console.error('Error during Google authentication:', error);
    throw error;
  }
}

// Function to refresh the access token
async function refreshAccessToken(): Promise<string> {
  // If we don't have a refresh token, get initial credentials
  if (!currentRefreshToken) {
    const tokenData = await getInitialAccessToken();
    return tokenData.access_token;
  }

  if (!DEPT_CLIENT_ID || !DEPT_CLIENT_SECRET) {
    throw new Error("Missing required credentials: DEPT_CLIENT_ID or DEPT_CLIENT_SECRET");
  }

  const params = new URLSearchParams({
    client_id: DEPT_CLIENT_ID,
    client_secret: DEPT_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: currentRefreshToken
  });

  try {
    const response = await fetch(DEPT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const tokenData = await response.json() as TokenResponse;
    
    // Update token variables
    currentAccessToken = tokenData.access_token;
    currentRefreshToken = tokenData.refresh_token;
    tokenExpiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

    console.error(`Token refreshed successfully. Expires at: ${tokenExpiresAt.toISOString()}`);
    return currentAccessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Function to get a valid access token
async function getValidAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (currentAccessToken && tokenExpiresAt && tokenExpiresAt > new Date(Date.now() + 60000)) {
    return currentAccessToken;
  }

  // Refresh the token
  return await refreshAccessToken();
}

// Validation schemas
const BookHoursSchema = z.object({
  hours: z.number().min(0.1).max(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  budgetId: z.string().optional(),
  employeeId: z.string().optional(),
  activityId: z.string().optional(),
  projectId: z.string().optional(),
  companyId: z.string().optional(),
  corporationId: z.string().optional(),
});

const BookHoursBulkSchema = z.object({
  hours: z.number().min(0.1).max(24),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  budgetId: z.string().optional(),
  employeeId: z.string().optional(),
  activityId: z.string().optional(),
  projectId: z.string().optional(),
  companyId: z.string().optional(),
  corporationId: z.string().optional(),
  weekdays: z.object({
    monday: z.boolean().optional().default(true),
    tuesday: z.boolean().optional().default(true),
    wednesday: z.boolean().optional().default(true),
    thursday: z.boolean().optional().default(true),
    friday: z.boolean().optional().default(true),
    saturday: z.boolean().optional().default(false),
    sunday: z.boolean().optional().default(false),
  }).optional().default({})
});

const UpdateHoursSchema = z.object({
  id: z.string(),
  hours: z.number().min(0.1).max(24).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().min(1).optional(),
});

const SearchBudgetSchema = z.object({
  term: z.string().min(1),
  corporationId: z.string().optional(),
});

const CheckBookedHoursSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeId: z.string().optional(),
  id: z.string().optional(),
});

const DeleteHoursSchema = z.object({
  id: z.string(),
});

// API helper function
async function deptApiCall(path: string, options: ApiOptions = {}) {
  const accessToken = await getValidAccessToken();

  const baseUrl = DEPT_API_BASE_URL?.endsWith('/') ? DEPT_API_BASE_URL.slice(0, -1) : DEPT_API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  console.error(`Making ${options.method || 'GET'} request to: ${url}`);
  
  try {
    const response = await fetch(url, { ...options, headers });

    // For DELETE requests, the response may be empty, so only parse JSON if there is content
    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (response.status !== 204 && contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

const server = new Server(
  {
    name: "dept-hour-booking",
    version: "1.0.5",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_google_oauth_url",
        description: "Get the Google OAuth URL for user login.",
        inputSchema: GoogleOAuthUrlSchema,
      },
      {
        name: "exchange_google_code",
        description: "Exchange Google OAuth code for ID token.",
        inputSchema: GoogleOAuthCodeSchema,
      },
      {
        name: "book_hours",
        description: "Book time entry in Dept system",
        inputSchema: {
          type: "object",
          properties: {
            hours: {
              type: "number",
              description: "Number of hours to book (0.1-24)",
              minimum: 0.1,
              maximum: 24,
            },
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            description: {
              type: "string",
              description: "Description of the work performed",
            },
            budgetId: {
              type: "string",
              description: "Budget ID (optional, will auto-search if not provided)",
            },
          },
          required: ["hours", "date", "description"],
        },
      },
      {
        name: "book_hours_bulk",
        description: "Book time entries in bulk across multiple days in Dept system",
        inputSchema: {
          type: "object",
          properties: {
            hours: {
              type: "number",
              description: "Number of hours to book per day (0.1-24)",
              minimum: 0.1,
              maximum: 24,
            },
            startDate: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            endDate: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            description: {
              type: "string",
              description: "Description of the work performed",
            },
            budgetId: {
              type: "string",
              description: "Budget ID (optional, will auto-search if not provided)",
            },
            weekdays: {
              type: "object",
              description: "Which weekdays to include (optional, defaults to Monday-Friday)",
              properties: {
                monday: { type: "boolean", default: true },
                tuesday: { type: "boolean", default: true },
                wednesday: { type: "boolean", default: true },
                thursday: { type: "boolean", default: true },
                friday: { type: "boolean", default: true },
                saturday: { type: "boolean", default: false },
                sunday: { type: "boolean", default: false },
              },
              additionalProperties: false,
            },
          },
          required: ["hours", "startDate", "endDate", "description"],
        },
      },
      {
        name: "update_hours",
        description: "Update existing time entry",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID of the time entry to update",
            },
            hours: {
              type: "number",
              description: "New number of hours",
              minimum: 0.1,
              maximum: 24,
            },
            date: {
              type: "string",
              description: "New date in YYYY-MM-DD format",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            description: {
              type: "string",
              description: "New description",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "search_budget",
        description: "Search for budgets by term",
        inputSchema: {
          type: "object",
          properties: {
            term: {
              type: "string",
              description: "Search term for budget",
            },
            corporationId: {
              type: "string",
              description: "Corporation ID (optional, uses default if not provided)",
            },
          },
          required: ["term"],
        },
      },
      {
        name: "check_booked_hours",
        description: "Check booked hours for a date range",
        inputSchema: {
          type: "object",
          properties: {
            from: {
              type: "string",
              description: "Start date in YYYY-MM-DD format",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            to: {
              type: "string",
              description: "End date in YYYY-MM-DD format",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
            employeeId: {
              type: "string",
              description: "Employee ID (optional, uses default if not provided)",
            },
            id: {
              type: "string",
              description: "Specific budget ID to check (optional)",
            },
          },
          required: ["from", "to"],
        },
      },      
      {
        name: "delete_hours",
        description: "Delete a time entry from the Dept system",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID of the time entry to delete",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_google_oauth_url": {
        const { redirectUri } = GoogleOAuthUrlSchema.parse(args);
        const url = getGoogleOAuthUrl(redirectUri);
        return {
          content: [
            {
              type: "text",
              text: `Google OAuth URL: ${url}`,
            },
          ],
        };
      }
      case "exchange_google_code": {
        const { code, redirectUri } = GoogleOAuthCodeSchema.parse(args);
        const idToken = await exchangeCodeForIdToken(code, redirectUri);
        return {
          content: [
            {
              type: "text",
              text: `Google ID Token: ${idToken}`,
            },
          ],
        };
      }
      case "book_hours": {
        const validated = BookHoursSchema.parse(args);
        
        let budgetId = validated.budgetId;

        // Auto-search for budget if not provided
        if (!budgetId && validated.description) {
          try {
            const searchData = await deptApiCall(
              `/budgets/search?searchTerm=${encodeURIComponent(validated.description)}&corporationId=${validated.corporationId || DEPT_CORPORATION_ID}`
            );
            if (Array.isArray(searchData) && searchData.length > 0) {
              budgetId = searchData[0].id;
            } else {
              budgetId = DEPT_DEFAULT_BUDGET_ID;
            }
          } catch (error) {
            console.error('Budget search failed:', error);
            budgetId = DEPT_DEFAULT_BUDGET_ID;
          }
        }

        if (!budgetId) {
          throw new Error('Budget ID is required and could not be determined');
        }

        const bookingData = {
          employeeId: validated.employeeId || DEPT_EMPLOYEE_ID,
          hours: validated.hours,
          date: validated.date,
          description: validated.description,
          repeat: { days: {}, until: `${validated.date}T22:00:00.000Z` },
          isLocked: false,
          activityId: validated.activityId || DEPT_DEFAULT_ACTIVITY_ID,
          companyId: validated.companyId || DEPT_DEFAULT_COMPANY_ID,
          corporationId: validated.corporationId || DEPT_CORPORATION_ID,
          projectId: validated.projectId || DEPT_DEFAULT_PROJECT_ID,
          budgetId: budgetId,
        };

        try {
          const result = await deptApiCall('/bookedhours', {
            method: 'POST',
            body: JSON.stringify(bookingData),
          });
          let bookingId = 'N/A';
          if (result && typeof result === 'object' && 'id' in result) {
            bookingId = (result as { id?: string }).id || 'N/A';
          }
          return {
            content: [
              {
                type: "text",
                text: `✅ Successfully booked ${validated.hours} hours for ${validated.date}\n\nDetails:\n- Description: ${validated.description}\n- Budget ID: ${budgetId}\n- Booking ID: ${bookingId}\n\nResult: ${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
            return {
              content: [
                {
                  type: "text",
                  text: (error as { message?: string }).message || "Google authentication required.",
                },
              ],
            };
          }
          throw error;
        }
      }

      case "book_hours_bulk": {
        const validated = BookHoursBulkSchema.parse(args);
        
        let budgetId = validated.budgetId;
        
        // Auto-search for budget if not provided
        if (!budgetId && validated.description) {
          try {
            const searchData = await deptApiCall(
              `/budgets/search?searchTerm=${encodeURIComponent(validated.description)}&corporationId=${validated.corporationId || DEPT_CORPORATION_ID}`
            );
            
            if (Array.isArray(searchData) && searchData.length > 0) {
              budgetId = searchData[0].id;
            } else {
              budgetId = DEPT_DEFAULT_BUDGET_ID;
            }
          } catch (error) {
            console.error('Budget search failed:', error);
            budgetId = DEPT_DEFAULT_BUDGET_ID;
          }
        }
        
        if (!budgetId) {
          throw new Error('Budget ID is required and could not be determined');
        }

        // Generate list of target dates based on weekday selection
        const generateDates = (startDate: string, endDate: string, weekdays: Record<string, boolean>) => {
          const dates = [];
          const start = new Date(startDate);
          const end = new Date(endDate);
          const current = new Date(start);

          // Map weekday names to JS day numbers (0=Sunday, 1=Monday, etc.)
          const dayMap = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
          };

          const selectedDays = Object.entries(weekdays || {})
            .filter(([, selected]) => selected)
            .map(([day]) => dayMap[day as keyof typeof dayMap]);

          // Default to Monday-Friday if no days selected
          if (selectedDays.length === 0) {
            selectedDays.push(1, 2, 3, 4, 5); // Mon-Fri
          }

          while (current <= end) {
            if (selectedDays.includes(current.getDay())) {
              dates.push(current.toISOString().split('T')[0]);
            }
            current.setDate(current.getDate() + 1);
          }

          return dates;
        };

        const targetDates = generateDates(validated.startDate, validated.endDate, validated.weekdays);

        if (targetDates.length === 0) {
          throw new Error('No valid dates found for the specified range and weekday selection');
        }

        // Convert weekdays to the API format (1=Monday, 2=Tuesday, etc.)
        const daysMap: Record<string, number> = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 0
        };

        const repeatDays: Record<string, boolean> = {};
        Object.entries(validated.weekdays || {}).forEach(([day, selected]) => {
          if (selected && daysMap[day] !== undefined) {
            repeatDays[daysMap[day].toString()] = true;
          }
        });

        // Default to Monday-Friday if no days specified
        if (Object.keys(repeatDays).length === 0) {
          repeatDays["1"] = true; // Monday
          repeatDays["2"] = true; // Tuesday
          repeatDays["3"] = true; // Wednesday
          repeatDays["4"] = true; // Thursday
          repeatDays["5"] = true; // Friday
        }

        const bulkBookingData = {
          employeeId: parseInt(validated.employeeId || DEPT_EMPLOYEE_ID || '0'),
          hours: validated.hours.toString(),
          date: validated.startDate,
          description: validated.description,
          repeat: {
            days: repeatDays,
            until: `${validated.endDate}T22:00:00.000Z`
          },
          isLocked: false,
          activityId: parseInt(validated.activityId || DEPT_DEFAULT_ACTIVITY_ID || '0'),
          corporationId: parseInt(validated.corporationId || DEPT_CORPORATION_ID || '0'),
          companyId: parseInt(validated.companyId || DEPT_DEFAULT_COMPANY_ID || '0'),
          projectId: parseInt(validated.projectId || DEPT_DEFAULT_PROJECT_ID || '0'),
          budgetId: parseInt(budgetId || '0'),
          dates: targetDates,
        };

        try {
          const result = await deptApiCall('/bookedhours/bulk', {
            method: 'POST',
            body: JSON.stringify(bulkBookingData),
          });

          const dayNames = Object.entries(validated.weekdays || {})
            .filter(([, selected]) => selected)
            .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

          const selectedDaysText = dayNames.length > 0 ? dayNames.join(', ') : 'Monday-Friday';

          return {
            content: [
              {
                type: "text",
                text: `✅ Successfully booked ${validated.hours} hours per day in bulk\n\nDetails:\n- Date Range: ${validated.startDate} to ${validated.endDate}\n- Days: ${selectedDaysText}\n- Total Days: ${targetDates.length}\n- Total Hours: ${validated.hours * targetDates.length}\n- Description: ${validated.description}\n- Budget ID: ${budgetId}\n\nDates booked: ${targetDates.join(', ')}\n\nResult: ${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
            return {
              content: [
                {
                  type: "text",
                  text: (error as { message?: string }).message || "Google authentication required.",
                },
              ],
            };
          }
          throw error;
        }
      }

      case "update_hours": {
        const validated = UpdateHoursSchema.parse(args);
        
        // Step 1: Fetch existing record using check_booked_hours (since direct GET is deprecated)
        const checkResult = await deptApiCall(`/bookedhours/custom/${DEPT_EMPLOYEE_ID}?from=2000-01-01&to=2100-01-01&id=${encodeURIComponent(validated.id)}`);
        let existingRecord: BookedHour | null = null;
        if (checkResult && typeof checkResult === 'object' && 'result' in checkResult && Array.isArray((checkResult as { result?: unknown }).result)) {
          existingRecord = (checkResult as { result: BookedHour[] }).result.find((entry: BookedHour) => String(entry.id) === String(validated.id)) || null;
        }

        if (!existingRecord) {
          throw new Error(`Time booking with ID ${validated.id} not found`);
        }

        // Step 2: Create update data by merging existing record with provided changes
        // Only update fields that are explicitly provided in the request
        const updateData = {
          // Core identifiers (preserved from existing)
          employeeId: existingRecord.employeeId || parseInt(DEPT_EMPLOYEE_ID || '0'),
          id: parseInt(validated.id),
          
          // Fields that can be updated (use provided value or preserve existing)
          date: validated.date || existingRecord.date,
          description: validated.description || existingRecord.description,
          hours: validated.hours !== undefined ? validated.hours.toString() : existingRecord.hours?.toString(),
          
          // Preserve all other existing fields exactly as they were
          repeat: existingRecord.repeat || { 
            days: {}, 
            until: `${validated.date || existingRecord.date || new Date().toISOString().split('T')[0]}T22:00:00.000Z` 
          },
          isLocked: existingRecord.isLocked || false,
          activityId: existingRecord.activityId || parseInt(DEPT_DEFAULT_ACTIVITY_ID || '0'),
          activityName: existingRecord.activityName || "Implementation",
          budgetId: existingRecord.budgetId || parseInt(DEPT_DEFAULT_BUDGET_ID || '0'),
          budgetName: existingRecord.budgetName || "Default Budget",
          companyId: existingRecord.companyId || parseInt(DEPT_DEFAULT_COMPANY_ID || '0'),
          companyName: existingRecord.companyName || "Default Company",
          employeeDisplayName: existingRecord.employeeDisplayName || "Employee",
          projectId: existingRecord.projectId || parseInt(DEPT_DEFAULT_PROJECT_ID || '0'),
          projectName: existingRecord.projectName || "Default Project",
          roleId: existingRecord.roleId || 33,
          serviceDeskTicketNumber: existingRecord.serviceDeskTicketNumber || null,
          serviceDeskTicketPriority: existingRecord.serviceDeskTicketPriority || "",
          canEdit: existingRecord.canEdit !== undefined ? existingRecord.canEdit : true,
          projectTaskId: existingRecord.projectTaskId || null,
          budgetGroupName: existingRecord.budgetGroupName || "Default Budget Group",
          timeBookingTypeId: existingRecord.timeBookingTypeId || 1,
          projectCategory: existingRecord.projectCategory || "Client",
          dates: existingRecord.dates || null,
        };

        // Step 3: Validate merged result (basic validation)
        if (!updateData.date) {
          throw new Error('Date is required and could not be determined from existing record');
        }
        if (!updateData.description) {
          throw new Error('Description is required and could not be determined from existing record');
        }
        if (!updateData.hours) {
          throw new Error('Hours is required and could not be determined from existing record');
        }

        // Step 4: Save updated record
        try {
          const result = await deptApiCall(`/bookedhours/${validated.id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
          });

          // Prepare change summary for user feedback
          const changes = [];
          if (validated.hours !== undefined) {
            changes.push(`- Hours: ${existingRecord.hours} → ${validated.hours}`);
          }
          if (validated.date) {
            changes.push(`- Date: ${existingRecord.date} → ${validated.date}`);
          }
          if (validated.description) {
            changes.push(`- Description: "${existingRecord.description}" → "${validated.description}"`);
          }

          return {
            content: [
              {
                type: "text",
                text: `✅ Successfully updated booking ${validated.id}\n\n${changes.length > 0 ? `Changes made:\n${changes.join('\n')}\n\n` : 'No changes were made.\n\n'}Preserved fields:\n- All other fields maintained their original values\n\nUpdated record: ${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
            return {
              content: [
                {
                  type: "text",
                  text: (error as { message?: string }).message || "Google authentication required.",
                },
              ],
            };
          }
          throw error;
        }
      }

      case "search_budget": {
        const validated = SearchBudgetSchema.parse(args);
        
        try {
          const result = await deptApiCall(
            `/budgets/search?searchTerm=${encodeURIComponent(validated.term)}&corporationId=${validated.corporationId || DEPT_CORPORATION_ID}`
          );

          // Handle different response formats
          let budgets: Budget[] = [];
          if (Array.isArray(result)) {
            budgets = result as Budget[];
          } else if (result && typeof result === 'object') {
            if ('data' in result && Array.isArray((result as { data?: unknown }).data)) {
              budgets = (result as { data: Budget[] }).data;
            } else if ('budgets' in result && Array.isArray((result as { budgets?: unknown }).budgets)) {
              budgets = (result as { budgets: Budget[] }).budgets;
            }
          }

          return {
            content: [
              {
                type: "text",
                text: `🔍 Found ${budgets.length} budgets matching "${validated.term}"\n\n${budgets.map((budget: Budget, index: number) => `${index + 1}. ${budget.name || 'Unnamed Budget'} (ID: ${budget.id})`).join('\n')}\n\nFull results:\n${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
            return {
              content: [
                {
                  type: "text",
                  text: (error as { message?: string }).message || "Google authentication required.",
                },
              ],
            };
          }
          throw error;
        }
      }

      case "check_booked_hours": {
        const validated = CheckBookedHoursSchema.parse(args);
        
        const employeeId = validated.employeeId || DEPT_EMPLOYEE_ID;
        
        // Support optional budgetId for filtering by specific budget
        // Never get more date range then 1 week. 
        // Default from and to to Today.
        let url = `/bookedhours/custom/${employeeId}?from=${validated.from || new Date().toISOString().split('T')[0]}&to=${validated.to || new Date().toISOString().split('T')[0]}`;
        if (validated.id) {
          url += `&id=${encodeURIComponent(validated.id)}`;
        }
        try {
          const result = await deptApiCall(url);

          // Calculate total hours for the period
          const bookedHours: BookedHour[] = Array.isArray(result) ? result as BookedHour[] : [];
          
          // Format date range for display
          const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });

          // Group by date for better readability
          const byDate: Record<string, BookedHour[]> = {};
          bookedHours.forEach((entry: BookedHour) => {
            const date = entry.date?.split('T')[0] || 'Unknown';
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(entry);
          });

          let summary = `📊 Booked Hours Summary (${formatDate(validated.from)} to ${formatDate(validated.to)})\n\n`;
          // Use result.result if available (API returns { result: [...] }), otherwise use result directly
          let entries: BookedHour[] = [];
          if (result && typeof result === 'object' && 'result' in result && Array.isArray((result as { result?: unknown }).result)) {
            entries = (result as { result: BookedHour[] }).result;
          } else if (Array.isArray(result)) {
            entries = result as BookedHour[];
          }
          const totalHours = entries.reduce((sum: number, entry: BookedHour) => sum + (parseFloat(String(entry.hours)) || 0), 0);

          summary += `**Total Hours**: ${totalHours} hours\n`;
          summary += `**Number of Entries**: ${entries.length}\n\n`;

          if (Array.isArray(entries) && entries.length > 0) {
            summary += `**Daily Breakdown**:\n`;
            // Rebuild byDate using entries to ensure correct grouping
            const byDate: Record<string, BookedHour[]> = {};
            entries.forEach((entry: BookedHour) => {
              const date = entry.date?.split('T')[0] || 'Unknown';
              if (!byDate[date]) byDate[date] = [];
              byDate[date].push(entry);
            });
            Object.keys(byDate).sort().forEach(date => {
              const dayHours = byDate[date].reduce((sum: number, entry: BookedHour) => sum + (parseFloat(String(entry.hours)) || 0), 0);
              summary += `• ${formatDate(date)}: ${dayHours} hours (${byDate[date].length} entries)\n`;
            });
          } else {
            summary += `❌ No hours booked in this period.\n`;
          }

          return {
            content: [
              {
                type: "text",
                text: summary + `\n**Full Details**:\n${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
            return {
              content: [
                {
                  type: "text",
                  text: (error as { message?: string }).message || "Google authentication required.",
                },
              ],
            };
          }
          throw error;
        }
      }

      case "delete_hours": {
        const validated = DeleteHoursSchema.parse(args);
        
        // Step 1: Fetch existing record using check_booked_hours (since direct GET is deprecated)
        const checkResult = await deptApiCall(`/bookedhours/custom/${DEPT_EMPLOYEE_ID}?from=2000-01-01&to=2100-01-01&id=${encodeURIComponent(validated.id)}`);
        let existingRecord: BookedHour | null = null;
        if (checkResult && typeof checkResult === 'object' && 'result' in checkResult && Array.isArray((checkResult as { result?: unknown }).result)) {
          existingRecord = (checkResult as { result: BookedHour[] }).result.find((entry: BookedHour) => String(entry.id) === String(validated.id)) || null;
        }

        if (!existingRecord) {
          throw new Error(`Time booking with ID ${validated.id} not found`);
        }

        // Step 2: Delete the record
        try {
          const result = await deptApiCall(`/bookedhours/${validated.id}`, {
            method: 'DELETE',
          });

          // Format date for display
          const formatDate = (dateStr: string) => {
            if (!dateStr) return 'Unknown';
            return new Date(dateStr).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          };

          return {
            content: [
              {
                type: "text",
                text: `🗑️ Successfully deleted time entry (ID: ${validated.id})\n\n` +
                      `**Deleted Entry Details:**\n` +
                      `- Date: ${formatDate(existingRecord.date)}\n` +
                      `- Hours: ${existingRecord.hours || 'Unknown'}\n` +
                      `- Description: ${existingRecord.description || 'No description'}\n` +
                      `- Project: ${existingRecord.projectName || 'Unknown'}\n` +
                      `- Budget: ${existingRecord.budgetName || 'Unknown'}\n\n` +
                      `**Deletion Result:** ${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'isGoogleAuthPrompt' in error && (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt) {
            return {
              content: [
                {
                  type: "text",
                  text: (error as { message?: string }).message || "Google authentication required.",
                },
              ],
            };
          }
          throw error;
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(ErrorCode.InvalidParams, `Invalid parameters: ${error.message}`);
    }
    
    console.error('Tool execution error:', error);
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Start server
async function main() {
  // Start OAuth callback server for Google authentication
  startOAuthCallbackServer(3005);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dept Hour Booking MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
#!/usr/bin/env node
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

dotenv.config();

const {
  DEPT_API_TOKEN,
  DEPT_API_BASE_URL = "https://deptapps-api.deptagency.com/public/api/v1",
  DEPT_EMPLOYEE_ID,
  DEPT_CORPORATION_ID,
  DEPT_DEFAULT_ACTIVITY_ID,
  DEPT_DEFAULT_PROJECT_ID,
  DEPT_DEFAULT_COMPANY_ID,
  DEPT_DEFAULT_BUDGET_ID,
} = process.env;

// Types for better type safety
interface Budget {
  id: string;
  name?: string;
  [key: string]: unknown;
}

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
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

// API helper function
async function deptApiCall(path: string, options: ApiOptions = {}) {
  if (!DEPT_API_TOKEN) {
    throw new Error("DEPT_API_TOKEN is required");
  }

  const baseUrl = DEPT_API_BASE_URL?.endsWith('/') ? DEPT_API_BASE_URL.slice(0, -1) : DEPT_API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers = {
    'Authorization': `Bearer ${DEPT_API_TOKEN}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  console.error(`Making ${options.method || 'GET'} request to: ${url}`);
  
  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

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
    version: "1.0.0",
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
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "book_hours": {
        const validated = BookHoursSchema.parse(args);
        
        let budgetId = validated.budgetId;
        
        // Auto-search for budget if not provided
        if (!budgetId && validated.description) {
          try {
            const searchData = await deptApiCall(
              `/budgets/search?searchTerm=${encodeURIComponent(validated.description)}&corporationId=${validated.corporationId || DEPT_CORPORATION_ID}`
            );
            
            if (searchData && searchData.length > 0) {
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

        const result = await deptApiCall('/bookedhours', {
          method: 'POST',
          body: JSON.stringify(bookingData),
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Successfully booked ${validated.hours} hours for ${validated.date}\n\nDetails:\n- Description: ${validated.description}\n- Budget ID: ${budgetId}\n- Booking ID: ${result.id || 'N/A'}\n\nResult: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case "update_hours": {
        const validated = UpdateHoursSchema.parse(args);
        
        const updateData = {
          employeeId: parseInt(DEPT_EMPLOYEE_ID || '0'),
          date: validated.date || "2025-07-04",
          description: validated.description || "Updated work",
          repeat: { days: {}, until: `${validated.date || '2025-07-04'}T22:00:00.000Z` },
          isLocked: false,
          id: parseInt(validated.id),
          activityId: parseInt(DEPT_DEFAULT_ACTIVITY_ID || '0'),
          activityName: "Implementation",
          budgetId: parseInt(DEPT_DEFAULT_BUDGET_ID || '0'),
          budgetName: "Default Budget",
          companyId: parseInt(DEPT_DEFAULT_COMPANY_ID || '0'),
          companyName: "Default Company",
          employeeDisplayName: "Employee",
          projectId: parseInt(DEPT_DEFAULT_PROJECT_ID || '0'),
          projectName: "Default Project",
          roleId: 33,
          serviceDeskTicketNumber: null,
          serviceDeskTicketPriority: "",
          canEdit: true,
          projectTaskId: null,
          budgetGroupName: "Default Budget Group",
          timeBookingTypeId: 1,
          projectCategory: "Client",
          hours: validated.hours?.toString() || "1",
          dates: null,
        };

        const result = await deptApiCall(`/bookedhours/${validated.id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Successfully updated booking ${validated.id}\n\nChanges:\n${validated.hours ? `- Hours: ${validated.hours}\n` : ''}${validated.date ? `- Date: ${validated.date}\n` : ''}${validated.description ? `- Description: ${validated.description}\n` : ''}\nResult: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case "search_budget": {
        const validated = SearchBudgetSchema.parse(args);
        
        const result = await deptApiCall(
          `/budgets/search?searchTerm=${encodeURIComponent(validated.term)}&corporationId=${validated.corporationId || DEPT_CORPORATION_ID}`
        );

        return {
          content: [
            {
              type: "text",
              text: `🔍 Found ${result?.budget?.length} budgets matching "${validated.term}"\n\n${result?.budget?.map((budget: Budget, index: number) => `${index + 1}. ${budget.name || 'Unnamed Budget'} (ID: ${budget.id})`).join('\n')}\n\nFull results:\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dept Hour Booking MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
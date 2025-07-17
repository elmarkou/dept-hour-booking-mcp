import { book_hours } from "./tools/book_hours.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { search_internal_budgets } from "./tools/search_internal_budgets.js";
import { book_hours_bulk } from "./tools/book_hours_bulk.js";
import { update_hours } from "./tools/update_hours.js";
import { search_budget } from "./tools/search_budget.js";
import { check_booked_hours } from "./tools/check_booked_hours.js";
import { delete_hours } from "./tools/delete_hours.js";
import { startOAuthCallbackServer } from "./utils/oauthCallbackServer.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// --- TOP-LEVEL ERROR LOGGING WRAPPER ---
async function main() {
  try {
    const server = new Server(
      {
        name: "dept-hourbooking",
        version: "1.1.0",
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
            description: "Book time single entry in Dept system",
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
                  type: "number",
                  description:
                    "Budget ID (optional, will auto-search if not provided)",
                },
              },
              required: ["hours", "date", "description"],
            },
          },
          {
            name: "book_hours_bulk",
            description:
              "Book time entries in bulk across multiple days in Dept system, use this when booking multiple dates or a date range",
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
                  type: "number",
                  description:
                    "Budget ID (optional, will auto-search if not provided)",
                },
                weekdays: {
                  type: "object",
                  description:
                    "Which weekdays to include (optional, defaults to Monday-Friday)",
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
            description: "Update a time entry in the Dept system",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  description: "ID of the time entry to update",
                },
                hours: {
                  type: "number",
                  description: "Updated number of hours (optional)",
                  minimum: 0.1,
                  maximum: 24,
                },
                date: {
                  type: "string",
                  description: "Updated date in YYYY-MM-DD format (optional)",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                },
                description: {
                  type: "string",
                  description: "Updated description (optional)",
                },
                budgetId: {
                  type: "number",
                  description: "Updated budget ID (optional)",
                },
                budgetName: {
                  type: "string",
                  description: "Updated budget name (optional)",
                },
                activityId: {
                  type: "number",
                  description: "Updated activity ID (optional)",
                },
                activityName: {
                  type: "string",
                  description: "Updated activity name (optional)",
                },
                projectId: {
                  type: "number",
                  description: "Updated project ID (optional)",
                },
                projectName: {
                  type: "string",
                  description: "Updated project name (optional)",
                },
                companyId: {
                  type: "number",
                  description: "Updated company ID (optional)",
                },
                isVacation: {
                  type: "boolean",
                  description: "Mark as vacation (optional)",
                },
              },
              required: ["id"],
            },
          },
          {
            name: "search_budget",
            description: "Search for a budget by term in the Dept system",
            inputSchema: {
              type: "object",
              properties: {
                term: {
                  type: "string",
                  description: "Search term",
                },
                corporationId: {
                  type: "number",
                  description: "Corporation ID (optional)",
                },
              },
              required: ["term"],
            },
          },
          {
            name: "search_internal_budgets",
            description:
              "Search for internal budgets by description in the Dept system",
            inputSchema: {
              type: "object",
              properties: {
                searchTerm: {
                  type: "string",
                  description: "Query to search for",
                },
              },
              required: ["searchTerm"],
            },
          },
          {
            name: "check_booked_hours",
            description:
              "Check booked hours for a date range and employee in the Dept system",
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
                  type: "number",
                  description:
                    "Employee ID (optional, uses default if not provided)",
                },
                id: {
                  type: "number",
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
                  type: "number",
                  description: "ID of the time entry to delete",
                },
              },
              required: ["id"],
            },
          },
        ],
      };
    });

    // Persistent storage for Google ID token
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const tokenFilePath = path.join(__dirname, "google_id_token.txt");
    let latestGoogleIdToken: string | null = null;

    // Load token from disk if available
    if (fs.existsSync(tokenFilePath)) {
      try {
        const token = fs.readFileSync(tokenFilePath, "utf8");
        if (token) latestGoogleIdToken = token.trim();
      } catch (err) {
        console.error("Failed to load Google ID token from disk:", err);
      }
    }

    // Handle tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        switch (name) {
          case "book_hours": {
            const { hours, date, description, budgetId } = args as {
              hours: number;
              date: string;
              description: string;
              budgetId?: number;
            };
            return await book_hours({
              hours,
              date,
              description,
              budgetId,
              idToken: latestGoogleIdToken,
            });
          }
          case "search_internal_budgets": {
            const { searchTerm } = args as { searchTerm: string };
            return await search_internal_budgets({ searchTerm });
          }
          case "book_hours_bulk": {
            const {
              hours,
              startDate,
              endDate,
              description,
              budgetId,
              weekdays,
            } = args as {
              hours: number;
              startDate: string;
              endDate: string;
              description: string;
              budgetId?: number;
              weekdays?: {
                monday?: boolean;
                tuesday?: boolean;
                wednesday?: boolean;
                thursday?: boolean;
                friday?: boolean;
                saturday?: boolean;
                sunday?: boolean;
              };
            };
            return await book_hours_bulk({
              hours,
              startDate,
              endDate,
              description,
              budgetId,
              weekdays,
              idToken: latestGoogleIdToken,
            });
          }
          case "update_hours": {
            const {
              id,
              hours,
              date,
              description,
              budgetId,
              budgetName,
              activityId,
              activityName,
              projectId,
              projectName,
              companyId,
              isVacation,
            } = args as {
              id: number;
              hours?: number;
              date?: string;
              description?: string;
              budgetId?: number;
              budgetName?: string;
              activityId?: number;
              activityName?: string;
              projectId?: number;
              projectName?: string;
              companyId?: number;
              isVacation?: boolean;
            };
            return await update_hours({
              id: typeof id === "string" ? Number(id) : id,
              hours,
              date,
              description,
              budgetId,
              budgetName,
              activityId,
              activityName,
              projectId,
              projectName,
              companyId,
              isVacation,
              idToken: latestGoogleIdToken,
            });
          }
          case "search_budget": {
            const { term, corporationId } = args as {
              term: string;
              corporationId?: string;
            };
            return await search_budget({
              term,
              corporationId,
              idToken: latestGoogleIdToken,
            });
          }
          case "check_booked_hours": {
            const { from, to, employeeId, id } = args as {
              from: string;
              to: string;
              employeeId?: number;
              id?: number;
            };
            return await check_booked_hours({
              from,
              to,
              employeeId,
              id,
              idToken: latestGoogleIdToken,
            });
          }
          case "delete_hours": {
            const { id } = args as { id: number };
            return await delete_hours({ id, idToken: latestGoogleIdToken });
          }
          default:
            throw new McpError(
              ErrorCode.InternalError,
              `Tool '${name}' not found.`
            );
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${error.message}`
          );
        }
        if (
          error &&
          typeof error === "object" &&
          "isGoogleAuthPrompt" in error &&
          (error as { isGoogleAuthPrompt?: boolean }).isGoogleAuthPrompt
        ) {
          const msg =
            typeof error.message === "string"
              ? error.message
              : "Google authentication required.";
          const url = typeof error.oauthUrl === "string" ? error.oauthUrl : "";
          return {
            content: [
              {
                type: "text",
                text: `${msg}\n\n[Click here to login with Google](${url})`,
              },
            ],
          };
        }
        console.error("Tool execution error:", error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`
        );
      }
    });
    // Start OAuth callback server for Google authentication on port 3500
    startOAuthCallbackServer(3005, (code, redirectUri, idToken) => {
      latestGoogleIdToken = idToken;
      // Persist token to disk
      try {
        fs.writeFileSync(tokenFilePath, idToken, "utf8");
      } catch (err) {
        console.error("Failed to save Google ID token to disk:", err);
      }
      console.log(
        `Google ID Token ${idToken.slice(
          0,
          30
        )}... successfully exchanged and stored.`
      );
      // The Google ID token is stored and now available in latestGoogleIdToken
      // You don't have to ask the user to re-authenticate again
      // Now retry the previous request if it was waiting for authentication
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (err) {
    console.error("FATAL MCP SERVER ERROR:", err);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED PROMISE REJECTION:", reason);
  process.exit(1);
});

main();

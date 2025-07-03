# Dept Hour Booking MCP Server

This is a configurable MCP Server in TypeScript that integrates with the Dept Public API for booking, updating, and searching hours/budgets. It provides a seamless interface for time tracking and project management through natural language interactions with AI assistants.

## Features

- **📝 Book Hours**: Create time entries with automatic budget lookup
- **✏️ Update Hours**: Modify existing time bookings
- **🔍 Search Budgets**: Find available budgets and projects
- **🔧 Configurable**: Environment-based configuration for different accounts
- **🔒 Secure**: Bearer token authentication with Dept API
- **🤖 AI-Ready**: Natural language interface through MCP protocol

## API Endpoints

| Endpoint           | Method | Description             | Example                                                                 |
| ------------------ | ------ | ----------------------- | ----------------------------------------------------------------------- |
| `/bookhours`       | POST   | Book time entry         | `{"hours": 2, "date": "2025-07-03", "description": "Development work"}` |
| `/updatehours/:id` | PUT    | Update existing booking | `{"hours": 3, "description": "Updated description"}`                    |
| `/searchbudget`    | GET    | Search for budgets      | `?term=project_name`                                                    |

## Configuration

Create a `.env` file with your Dept API credentials:

```bash
API_BASE_URL=https://deptapps-api.deptagency.com/public/api/v1/
BEARER_TOKEN=your_bearer_token_here
EMPLOYEE_ID=your_employee_id
CORPORATION_ID=your_corporation_id
DEFAULT_ACTIVITY_ID=your_default_activity_id
DEFAULT_PROJECT_ID=your_default_project_id
DEFAULT_COMPANY_ID=your_default_company_id
DEFAULT_BUDGET_ID=your_default_budget_id
```

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   - Copy your Dept API credentials to `.env`
   - Update default IDs for your account

3. **Start the server:**

   ```bash
   npm run dev:sse
   ```

4. **Test endpoints:**

   ```bash
   # Book 2 hours
   curl -X POST http://localhost:3000/bookhours \
     -H "Content-Type: application/json" \
     -d '{"hours": 2, "date": "2025-07-03", "description": "Development work"}'

   # Search budgets
   curl "http://localhost:3000/searchbudget?term=project"

   # Update booking
   curl -X PUT http://localhost:3000/updatehours/12345 \
     -H "Content-Type: application/json" \
     -d '{"hours": 3, "description": "Updated work"}'
   ```

## Using with AI Assistants

Once configured as an MCP server, you can interact naturally:

- _"Book 4 hours for NDH-2286 today"_
- _"Search for Medela budgets"_
- _"Update my last booking to 3 hours"_
- _"Find all available budgets for testing"_

## How it Works

1. **Automatic Budget Lookup**: When booking hours without a `budgetId`, the server searches for matching budgets based on the description
2. **Smart Defaults**: Uses configured default values for employee, project, and company IDs
3. **Fallback Handling**: Falls back to `DEFAULT_BUDGET_ID` when budget search fails
4. **Complete Payloads**: Constructs proper API payloads matching Dept's requirements

## Project Structure

```
├── src/
│   ├── index.ts          # MCP server entry point
│   └── server.ts         # Express server with API endpoints
├── .env                  # Environment configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Debugging & Development

> **Prerequisites:** [Node.js](https://nodejs.org/) is required to run the MCP Server.

### Debug Modes

| Debug Mode                | Description                         | Steps                                                                                                                                          |
| ------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent Builder**         | Debug via AI Toolkit Agent Builder  | 1. Open VS Code Debug panel<br>2. Select `Debug in Agent Builder` and press `F5`<br>3. Use Agent Builder to test with natural language prompts |
| **MCP Inspector (SSE)**   | Visual debugging with MCP Inspector | 1. Select `Debug SSE in Inspector`<br>2. Press `F5` to launch browser inspector<br>3. Click `Connect` and test endpoints                       |
| **MCP Inspector (STDIO)** | STDIO debugging mode                | 1. Select `Debug STDIO in Inspector`<br>2. Press `F5` and click `Connect` in browser<br>3. Test tools with parameters                          |

### Port Configuration

| Mode                  | Ports                                  | Configuration Files                                                            |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Agent Builder         | 3001                                   | [`.vscode/tasks.json`](.vscode/tasks.json), [`.aitk/mcp.json`](.aitk/mcp.json) |
| MCP Inspector (SSE)   | 3001 (Server), 5173 & 3000 (Inspector) | [`.vscode/launch.json`](.vscode/launch.json)                                   |
| MCP Inspector (STDIO) | Auto-configured                        | [`.vscode/launch.json`](.vscode/launch.json)                                   |

## Example Usage

### Natural Language with AI Assistant

```
"Book 2 hours for NDH-2286 today"
"Search for budgets containing 'Medela'"
"Update booking 13827812 to 3 hours"
"Find all available Canva projects"
```

### Direct API Calls

```bash
# Book hours with automatic budget lookup
curl -X POST http://localhost:3000/bookhours \
  -H "Content-Type: application/json" \
  -d '{"hours": 2, "description": "Feature development"}'

# Update existing booking
curl -X PUT http://localhost:3000/updatehours/13827812 \
  -H "Content-Type: application/json" \
  -d '{"hours": 3, "description": "Extended development work"}'

# Search for project budgets
curl "http://localhost:3000/searchbudget?term=Logitech"
```

## Troubleshooting

### Common Issues

- **Authorization Denied**: Check your `BEARER_TOKEN` in `.env`
- **Budget Not Found**: Verify `DEFAULT_BUDGET_ID` is valid
- **Grace Period Error**: Updates may have time restrictions in Dept API
- **Server Won't Start**: Ensure port 3000 is available

### Environment Variables

All configuration happens through `.env`. Copy your credentials from the Dept dashboard and ensure IDs match your account setup.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both curl and AI assistant
5. Submit a pull request

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

---

Built with ❤️ for seamless time tracking integration with Dept Public API.

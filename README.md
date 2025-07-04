# Dept Hour Booking MCP Server

> **🚧 Work in Progress** 
> 
> This project is currently under active development. 
> 
> **TODO**: Fix DEPT authentication - Currently experiencing 401 errors with API calls. A valid Dept API token is required for proper functionality.

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that integrates with the Dept Public API for time tracking and project management. Built following the same patterns as the [GitHub MCP Server](https://github.com/github/github-mcp-server).

## Features

- **📝 Book Hours**: Create time entries with automatic budget lookup
- **✏️ Update Hours**: Modify existing time bookings
- **🔍 Search Budgets**: Find available budgets and projects
- **🔧 Configurable**: Environment-based configuration
- **🔒 Secure**: Dept API token authentication
- **🐳 Docker Ready**: Easy deployment with Docker
- **🤖 AI-Ready**: Natural language interface through MCP protocol

## Quick Start

### Option 1: Local Development (Recommended)

1. **Clone and setup:**

   ```bash
   git clone <your-repo>
   cd dept-hour-booking
   npm install
   ```

2. **Configure VS Code:**
   Copy the contents of `.vscode/mcp-local.json` to your VS Code MCP settings, or create a workspace configuration.

3. **Start using in VS Code:**
   - Toggle Agent mode in VS Code
   - Enter your Dept credentials when prompted
   - Start using natural language commands!

### Option 2: Docker (For Production)

1. **Build the image:**

   ```bash
   docker build -t dept-hour-booking-mcp-server .
   ```

2. **Configure VS Code:**
   Use the Docker configuration from `.vscode/mcp.json`

### VS Code MCP Configuration (Local Development)

Add this to your VS Code MCP settings (use the local development option):

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "dept_api_token",
        "description": "Dept API Token",
        "password": true
      },
      {
        "type": "promptString",
        "id": "dept_employee_id",
        "description": "Your Dept Employee ID"
      },
      {
        "type": "promptString",
        "id": "dept_corporation_id",
        "description": "Your Dept Corporation ID"
      },
      {
        "type": "promptString",
        "id": "dept_default_budget_id",
        "description": "Default Budget ID"
      }
    ],
    "servers": {
      "dept-hour-booking": {
        "command": "node",
        "args": ["-r", "ts-node/register", "./src/index.ts"],
        "cwd": "/path/to/your/dept-hour-booking",
        "env": {
          "DEPT_API_TOKEN": "${input:dept_api_token}",
          "DEPT_EMPLOYEE_ID": "${input:dept_employee_id}",
          "DEPT_CORPORATION_ID": "${input:dept_corporation_id}",
          "DEPT_DEFAULT_BUDGET_ID": "${input:dept_default_budget_id}"
        }
      }
    }
  }
}
```

> **Important**: Replace `/path/to/your/dept-hour-booking` with the actual path to this project on your system.

### VS Code MCP Configuration (Docker)

If you prefer to use Docker:

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "dept_api_token",
        "description": "Dept API Token",
        "password": true
      },
      {
        "type": "promptString",
        "id": "dept_employee_id",
        "description": "Your Dept Employee ID"
      },
      {
        "type": "promptString",
        "id": "dept_corporation_id",
        "description": "Your Dept Corporation ID"
      },
      {
        "type": "promptString",
        "id": "dept_default_budget_id",
        "description": "Default Budget ID"
      }
    ],
    "servers": {
      "dept-hour-booking": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "DEPT_API_TOKEN",
          "-e",
          "DEPT_EMPLOYEE_ID",
          "-e",
          "DEPT_CORPORATION_ID",
          "-e",
          "DEPT_DEFAULT_BUDGET_ID",
          "ghcr.io/yourusername/dept-hour-booking-mcp-server"
        ],
        "env": {
          "DEPT_API_TOKEN": "${input:dept_api_token}",
          "DEPT_EMPLOYEE_ID": "${input:dept_employee_id}",
          "DEPT_CORPORATION_ID": "${input:dept_corporation_id}",
          "DEPT_DEFAULT_BUDGET_ID": "${input:dept_default_budget_id}"
        }
      }
    }
  }
}
```

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "dept-hour-booking": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "DEPT_API_TOKEN",
        "-e",
        "DEPT_EMPLOYEE_ID",
        "-e",
        "DEPT_CORPORATION_ID",
        "-e",
        "DEPT_DEFAULT_BUDGET_ID",
        "ghcr.io/yourusername/dept-hour-booking-mcp-server"
      ],
      "env": {
        "DEPT_API_TOKEN": "<YOUR_DEPT_API_TOKEN>",
        "DEPT_EMPLOYEE_ID": "<YOUR_EMPLOYEE_ID>",
        "DEPT_CORPORATION_ID": "<YOUR_CORPORATION_ID>",
        "DEPT_DEFAULT_BUDGET_ID": "<YOUR_DEFAULT_BUDGET_ID>"
      }
    }
  }
}
```

## Prerequisites

1. **Docker**: Required for containerized deployment
2. **Dept API Token**: You'll need a Dept API token (not the changing bearer token)
3. **Account IDs**: Your Dept employee ID, corporation ID, and default budget ID

## Configuration

The server is configured through environment variables:

| Variable                   | Description                        | Required |
| -------------------------- | ---------------------------------- | -------- |
| `DEPT_API_TOKEN`           | Your Dept API token                | Yes      |
| `DEPT_EMPLOYEE_ID`         | Your Dept employee ID              | Yes      |
| `DEPT_CORPORATION_ID`      | Your Dept corporation ID           | Yes      |
| `DEPT_DEFAULT_BUDGET_ID`   | Default budget ID for time entries | Yes      |
| `DEPT_DEFAULT_ACTIVITY_ID` | Default activity ID                | No       |
| `DEPT_DEFAULT_PROJECT_ID`  | Default project ID                 | No       |
| `DEPT_DEFAULT_COMPANY_ID`  | Default company ID                 | No       |

## Available Tools

### `book_hours`

Book time entry in Dept system.

**Parameters:**

- `hours` (number): Hours to book (0.1-24)
- `date` (string): Date in YYYY-MM-DD format
- `description` (string): Work description
- `budgetId` (string, optional): Budget ID (auto-searches if not provided)

**Example:**

```json
{
  "hours": 2.5,
  "date": "2025-07-04",
  "description": "Feature development for NDH-2286"
}
```

### `update_hours`

Update existing time entry.

**Parameters:**

- `id` (string): Time entry ID to update
- `hours` (number, optional): New hours
- `date` (string, optional): New date
- `description` (string, optional): New description

**Example:**

```json
{
  "id": "12345",
  "hours": 3.0,
  "description": "Updated development work"
}
```

### `search_budget`

Search for budgets by term.

**Parameters:**

- `term` (string): Search term
- `corporationId` (string, optional): Corporation ID

**Example:**

```json
{
  "term": "Medela"
}
```

## Natural Language Usage

Once configured, you can interact with the server using natural language:

- _"Book 2 hours for NDH-2286 development work today"_
- _"Search for budgets containing 'Medela'"_
- _"Update booking 12345 to 3 hours"_
- _"Find all available Canva projects"_

## Local Development

### Using Docker Compose

1. **Clone the repository**
2. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
3. **Run with Docker Compose:**
   ```bash
   docker-compose up
   ```

### Using Node.js

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run in development mode:**
   ```bash
   npm run dev:stdio
   ```

### Using with MCP Inspector

1. **Start the server:**

   ```bash
   npm run dev:stdio
   ```

2. **Connect with MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

## Building Docker Image

```bash
# Build the image
docker build -t dept-hour-booking-mcp-server .

# Run the container
docker run -i --rm \
  -e DEPT_API_TOKEN="your_token_here" \
  -e DEPT_EMPLOYEE_ID="your_employee_id" \
  -e DEPT_CORPORATION_ID="your_corporation_id" \
  -e DEPT_DEFAULT_BUDGET_ID="your_budget_id" \
  dept-hour-booking-mcp-server
```

## Project Structure

```
├── src/
│   └── index.ts          # Main MCP server implementation
├── .vscode/
│   └── mcp.json          # VS Code MCP configuration
├── .env.example          # Environment configuration template
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose for development
└── README.md            # This file
```

## How It Works

1. **MCP Protocol**: Uses the Model Context Protocol for AI tool integration
2. **Automatic Budget Lookup**: Searches for matching budgets when not specified
3. **Smart Defaults**: Uses configured default values for common fields
4. **Error Handling**: Comprehensive error handling and validation
5. **Docker Ready**: Easy deployment and configuration management

## Getting Your Dept API Token

To get your Dept API token:

1. Log into your Dept account
2. Go to Settings > API
3. Generate a new API token
4. Copy the token (this is different from the session bearer token)

> **Note**: Unlike bearer tokens that change frequently, API tokens are more stable and suitable for automation.

## Troubleshooting

### Common Issues

- **"DEPT_API_TOKEN is required"**: Make sure you've set your API token
- **"Invalid parameters"**: Check your input format matches the schema
- **"API Error 401"**: Your API token may be invalid or expired
- **"Budget not found"**: Verify your default budget ID is correct

### Docker Issues

- **Port conflicts**: Make sure no other services are using the same port
- **Permission denied**: Ensure Docker is running and you have proper permissions
- **Image not found**: Build the image locally or check the registry

### VS Code Integration

- **Server not starting**: Check your MCP configuration syntax
- **Environment variables not set**: Verify your input prompts are configured
- **Agent mode not working**: Ensure you're using VS Code 1.101 or later

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with MCP Inspector
5. Submit a pull request

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

---

Built with ❤️ following the GitHub MCP Server pattern for seamless AI integration.

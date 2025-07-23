# Dept Hour Booking MCP Server

> **✅ Version 1.1.1 - Latest Release** > **Current Status**: Functional with Google Auth, bulk booking capabilities, and time entry deletion.

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that integrates with the Dept Public API for time tracking and project management. Built following the same patterns as the [GitHub MCP Server](https://github.com/github/github-mcp-server).

### Examples

![Example 1](https://raw.githubusercontent.com/elmarkou/dept-hourbooking/refs/heads/main/docs/screenshot1.png)
![Example 2](https://raw.githubusercontent.com/elmarkou/dept-hourbooking/refs/heads/main/docs/screenshot2.png)

## Features

- **📝 Book Hours**: Create individual time entries with automatic budget lookup
- **📅 Bulk Book Hours**: Efficiently book hours across multiple days with date range and weekday selection
- **✏️ Update Hours**: Modify existing time bookings with proper data preservation
- **🗑️ Delete Hours**: Remove time entries from the system with confirmation
- **🔍 Search Budgets**: Find available budgets and projects
- **📋 Check Booked Hours**: View time entries for specific date ranges
- **🔎 Search Internal Budgets**: Quickly find internal budgets (e.g., vacation, holiday, illness)
- **🔧 Configurable**: Environment-based configuration
- **🔒 Secure**: Google ID token authentication with automatic refresh
- **🐳 Docker Ready**: Easy deployment with Docker Compose
- **🤖 AI-Ready**: Natural language interface through MCP protocol

## Quick Start

> **✅ ZERO SETUP REQUIRED**: Multiple options available - choose what works best for you!

### 🚀 Easiest Installation: VS Code Extension

1. **Install the MCP Extension:**
   - Install the [Copilot MCP Extension](https://marketplace.visualstudio.com/items?itemName=AutomataLabs.copilot-mcp) from the VS Code Marketplace
   - Or search for "Copilot MCP" in VS Code Extensions
2. **Install this MCP Server:**
   - The extension provides a user-friendly interface to install and configure MCP servers
   - Simply search for "Dept Hour Booking" or use the repository URL
   - The extension handles all the configuration automatically
3. **Configure the variables** – All required variables are automatically added to the Docker configuration. See [VS Code MCP Configuration](#vs-code-mcp-configuration) for details.

### VS Code MCP (Manual Configuration)

**Recommended: .vscode/mcp.json**

1. In VS Code, press <kbd>CMD</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> and search for `MCP: Add Server`
2. Choose **Docker Image**
3. Enter `elmarkou/dept-hourbooking` as the image name
4. VS Code will prompt for your credentials when you first connect

## VS Code MCP Configuration

> **You do NOT need to clone the repository to use the Dept Hour Booking MCP server in Visual Studio Code. Just use Docker! Clone only if you want to make changes to the code or develop locally.**

These configuration options are for setting up the Dept Hour Booking MCP server in Visual Studio Code using the Copilot MCP extension.

The recommended solution is to use `.vscode/mcp.json` for your VS Code MCP configuration. This option provides automatic Docker image building, clean output, and is perfect for both development and customization.

**.vscode/mcp.json (Recommended)**

- **Automatic setup**: Builds Docker image automatically on first use
- **For development and customization**: Clone the repository if you want to make changes to the code
- **Clean output**: Suppresses Docker build warnings for a clean MCP experience
- Uses `docker-compose` for automatic dependency management
- More isolated and consistent environment

You will be prompted for credentials:

- **Dept Client ID**: Your Dept client ID (typically "17")
- **Dept Client Secret**: Your client secret (contact Dept admin if needed)
- **Employee ID**: Your Dept employee ID
- **Corporation ID**: Your Dept corporation ID
- **Default Activity ID, Project ID, Company ID, Budget ID**: Your default IDs

**Important:**

```json
{
  "inputs": [
    {
      "id": "deptEmployeeId",
      "type": "string",
      "description": "Your Dept employee ID"
    },
    {
      "id": "deptCorporationId",
      "type": "string",
      "description": "Your Dept corporation ID"
    },
    {
      "id": "deptDefaultActivityId",
      "type": "string",
      "description": "Default activity ID (optional)"
    },
    {
      "id": "deptDefaultProjectId",
      "type": "string",
      "description": "Default project ID (optional)"
    },
    {
      "id": "deptDefaultCompanyId",
      "type": "string",
      "description": "Default company ID (optional)"
    },
    {
      "id": "deptDefaultBudgetId",
      "type": "string",
      "description": "Default budget ID"
    }
  ],
  "dept-hourbooking": {
    "type": "stdio",
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "-p",
      "3100:3100",
      "-p",
      "3005:3005",
      "-e",
      "DEPT_EMPLOYEE_ID",
      "-e",
      "DEPT_CORPORATION_ID",
      "-e",
      "DEPT_DEFAULT_ACTIVITY_ID",
      "-e",
      "DEPT_DEFAULT_PROJECT_ID",
      "-e",
      "DEPT_DEFAULT_COMPANY_ID",
      "-e",
      "DEPT_DEFAULT_BUDGET_ID",
      "-e",
      "DOCKER_CONTAINER=true",
      "elmarkou/dept-hourbooking"
    ],
    "env": {
      "DEPT_EMPLOYEE_ID": "${input:deptEmployeeId}",
      "DEPT_CORPORATION_ID": "${input:deptCorporationId}",
      "DEPT_DEFAULT_ACTIVITY_ID": "${input:deptDefaultActivityId}",
      "DEPT_DEFAULT_PROJECT_ID": "${input:deptDefaultProjectId}",
      "DEPT_DEFAULT_COMPANY_ID": "${input:deptDefaultCompanyId}",
      "DEPT_DEFAULT_BUDGET_ID": "${input:deptDefaultBudgetId}"
    }
  }
}
```

**Summary:**
After adding the server, always update the configuration file to include all required ports and environment variables for the MCP server to work correctly.

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings (`claude_desktop_config.json`):

#### Option 1: Docker Hub (Easiest - No Build Required) ⭐⭐⭐

```json
{
  "mcpServers": {
    "dept-hourbooking": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-p",
        "3100:3100",
        "-p",
        "3005:3005",
        "-e",
        "DEPT_EMPLOYEE_ID=<YOUR_EMPLOYEE_ID>",
        "-e",
        "DEPT_CORPORATION_ID=<YOUR_CORPORATION_ID>",
        "-e",
        "DEPT_DEFAULT_ACTIVITY_ID=<YOUR_DEFAULT_ACTIVITY_ID>",
        "-e",
        "DEPT_DEFAULT_PROJECT_ID=<YOUR_DEFAULT_PROJECT_ID>",
        "-e",
        "DEPT_DEFAULT_COMPANY_ID=<YOUR_DEFAULT_COMPANY_ID>",
        "-e",
        "DEPT_DEFAULT_BUDGET_ID=<YOUR_DEFAULT_BUDGET_ID>",
        "-e",
        "DOCKER_CONTAINER=true",
        "elmarkou/dept-hourbooking:latest"
      ]
    }
  }
}
```

#### Option 2: Local Docker Build (Requires repository clone)

```json
{
  "mcpServers": {
    "dept-hourbooking": {
      "command": "docker-compose",
      "args": [
        "run",
        "--rm",
        "-T",
        "-p",
        "3100:3100",
        "-p",
        "3005:3005",
        "dept-hourbooking"
      ],
      "cwd": "/absolute/path/to/your/dept-hourbooking",
      "env": {
        "DEPT_EMPLOYEE_ID": "<YOUR_EMPLOYEE_ID>",
        "DEPT_CORPORATION_ID": "<YOUR_CORPORATION_ID>",
        "DEPT_DEFAULT_ACTIVITY_ID": "<YOUR_DEFAULT_ACTIVITY_ID>",
        "DEPT_DEFAULT_PROJECT_ID": "<YOUR_DEFAULT_PROJECT_ID>",
        "DEPT_DEFAULT_COMPANY_ID": "<YOUR_DEFAULT_COMPANY_ID>",
        "DEPT_DEFAULT_BUDGET_ID": "<YOUR_DEFAULT_BUDGET_ID>"
      }
    }
  }
}
```

#### Option 3: Node.js Direct (Requires manual build)

```json
{
  "mcpServers": {
    "dept-hourbooking": {
      "command": "node",
      "args": ["./lib/src/index.js"],
      "cwd": "/absolute/path/to/your/dept-hourbooking",
      "env": {
        "DEPT_EMPLOYEE_ID": "<YOUR_EMPLOYEE_ID>",
        "DEPT_CORPORATION_ID": "<YOUR_CORPORATION_ID>",
        "DEPT_DEFAULT_ACTIVITY_ID": "<YOUR_DEFAULT_ACTIVITY_ID>",
        "DEPT_DEFAULT_PROJECT_ID": "<YOUR_DEFAULT_PROJECT_ID>",
        "DEPT_DEFAULT_COMPANY_ID": "<YOUR_DEFAULT_COMPANY_ID>",
        "DEPT_DEFAULT_BUDGET_ID": "<YOUR_DEFAULT_BUDGET_ID>"
      }
    }
  }
}
```

**Notes**:

- **Option 1 (Docker Hub)**: ⭐ **RECOMMENDED** - No setup required, works anywhere with Docker, **no `cwd` needed**
- **Option 2 (Local Build)**: Requires cloning repository and replacing `/absolute/path/to/your/dept-hourbooking` with actual path
- **Option 3 (Node.js)**: Requires running `npm install && npm run build` first and setting correct `cwd` path
- **Examples of absolute paths**:
  - macOS/Linux: `/Users/yourname/projects/dept-hourbooking` or `/home/yourname/dept-hourbooking`
  - Windows: `C:\\Users\\yourname\\projects\\dept-hourbooking`

## Prerequisites

1. **Docker**: Required for containerized deployment
2. **Google Cloud Project**: with OAuth 2.0 credentials

## Configuration

The server is configured through environment variables:

| Variable                   | Description                        | Required |
| -------------------------- | ---------------------------------- | -------- |
| `DEPT_EMPLOYEE_ID`         | Your Dept employee ID              | Yes      |
| `DEPT_CORPORATION_ID`      | Your Dept corporation ID           | Yes      |
| `DEPT_DEFAULT_BUDGET_ID`   | Default budget ID for time entries | Yes      |
| `DEPT_DEFAULT_ACTIVITY_ID` | Default activity ID                | No       |
| `DEPT_DEFAULT_PROJECT_ID`  | Default project ID                 | No       |
| `DEPT_DEFAULT_COMPANY_ID`  | Default company ID                 | No       |

## Available Tools

### Booking Hours: Single vs. Bulk

> **Best Practice:**
>
> - Use `book_hours` for single date bookings.
> - Use `book_hours_bulk` for multiple dates, date ranges, or repeated bookings.

#### `book_hours` (Single Date)

Book a time entry for a single date in the Dept system.

**Parameters:**

- `hours` (number): Hours to book (0.1-24)
- `date` (string): Date in YYYY-MM-DD format
- `description` (string): Work description
- `budgetId` (number, optional): Budget ID (auto-searches if not provided)

**Example:**

```json
{
  "hours": 2.5,
  "date": "2025-07-04",
  "description": "Feature development for NDH-2286"
}
```

#### `book_hours_bulk` (Multiple Dates / Range / Repeat)

Book time entries across multiple days, a date range, or selected weekdays in a single operation.

**Parameters:**

- `hours` (number): Hours to book per day (0.1-24)
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `description` (string): Work description for all entries
- `budgetId` (number, optional): Budget ID (auto-searches if not provided)
- `weekdays` (object, optional): Which weekdays to include (defaults to Monday-Friday)
  - `monday` (boolean): Include Monday (default: true)
  - `tuesday` (boolean): Include Tuesday (default: true)
  - `wednesday` (boolean): Include Wednesday (default: true)
  - `thursday` (boolean): Include Thursday (default: true)
  - `friday` (boolean): Include Friday (default: true)
  - `saturday` (boolean): Include Saturday (default: false)
  - `sunday` (boolean): Include Sunday (default: false)

**Example:**

```json
{
  "hours": 8,
  "startDate": "2025-07-07",
  "endDate": "2025-07-11",
  "description": "Weekly development work for project NDH-2286",
  "weekdays": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": false,
    "sunday": false
  }
}
```

> **Note:**
>
> - Always use `book_hours_bulk` for booking hours across multiple dates, a range, or repeated weekdays. This is more efficient and ensures correct handling of bulk operations.
> - `book_hours` should only be used for single date bookings.

**Natural Language Examples:**

- _"Book 8 hours per day from Monday to Friday next week for NDH-2286"_ → uses `book_hours_bulk`
- _"Book 2 hours for NDH-2286 today"_ → uses `book_hours`

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

### `search_internal_budgets`

Search for internal budgets by term.

**Parameters:**

- `searchTerm` (string): Search term (e.g., "vacation", "internal", "holiday")

**Example:**

```json
{
  "searchTerm": "vacation"
}
```

**Parameters:**

- `id` (string): Time entry ID to retrieve

**Example:**

```json
{
  "id": "12345"
}
```

### `delete_hours`

Delete a time entry from the Dept system.

**Parameters:**

- `id` (string): Time entry ID to delete

**Example:**

```json
{
  "id": "12345"
}
```

> **⚠️ Warning**: This action is irreversible. The time entry will be permanently deleted from the system.

## Natural Language Usage

Once configured, you can interact with the server using natural language:

- _"Book 2 hours for NDH-2286 development work today"_
- _"Book 8 hours per day for this week working on project development"_
- _"Search for budgets containing 'Medela'"_
- _"Search for internal budgets like vacation or illness"_
- _"Update booking 12345 to 3 hours"_
- _"Delete time entry 12345"_
- _"Remove the booking with ID 67890"_
- _"Show me details for time entry 12345"_
- _"Find all available Canva projects"_
- _"Book 6 hours daily from Monday to Friday for sprint work"_

## Local Development

**Development: Node.js Direct**

- If you prefer Node.js over Docker, run:
  ```bash
  npm install && npm run build
  ```
- Then use `.vscode/mcp.json`

### Manual Setup (Optional)

Only needed if you want to pre-build or test. We provide convenient npm scripts for all tasks:

```bash
# Setup and preparation
npm run setup          # Run initial setup script
npm run setup:mcp      # Setup MCP-specific configuration

# Docker operations
npm run docker:build    # Build Docker image
npm run docker:run      # Run MCP server with Docker
npm run docker:cleanup  # Clean up Docker resources
npm run docker:pull     # Pull Docker image from registry
npm run deploy:docker   # Build and push to Docker Hub

# Development and testing
npm run build           # Build TypeScript project
npm run dev:stdio       # Run in development mode
npm run dev:inspector   # Start MCP Inspector
```

**Quick commands:**

```bash
# Most common: Setup
npm run setup

# Docker workflow
npm run docker:build && npm run docker:run

# Development workflow
npm run build && npm run dev:stdio
```

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

docker-compose build
docker-compose up
docker build -t depthourbooking-dept-hourbooking .
docker run -i --rm \

## Building Docker Image

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

## How It Works

1. **MCP Protocol**: Uses the Model Context Protocol for AI tool integration
2. **Google OAuth Authentication**: Uses Google ID token for initial authentication
3. **Automatic Token Refresh**: Manages access token refresh automatically using refresh tokens
4. **Automatic Budget Lookup**: Searches for matching budgets when not specified
5. **Smart Defaults**: Uses configured default values for common fields
6. **Error Handling**: Comprehensive error handling and validation
7. **Docker Ready**: Easy deployment with Docker Compose

## Getting Your Dept Credentials

To get your Dept credentials:

1. **Client ID**: Typically "17" (standard Dept client ID)
2. **Client Secret**: Contact your Dept administrator
3. **Employee/Corporation IDs**: Available in your Dept profile or from administrator

### Getting a Google ID Token

## Authentication Flow (First-Time Users)

When you access the system for the first time, you will see a prompt indicating that you are not authenticated. The server will direct you to the Google SSO (Single Sign-On) page to complete authentication.

**Steps:**

1. Follow the prompt to open the Google SSO page in your browser.
2. Sign in with your Google account as required.
3. After successful authentication, you can close the browser window.
4. Return to Copilot and confirm that you are authenticated to continue using the system.

This process ensures secure access and is only required on your first use or if your authentication expires.

## Troubleshooting

### Common Issues

- **"Building Docker image... (first time)"**: This is normal! Docker is automatically building the image for you
- **Long first startup**: First run builds the Docker image (takes 30-60 seconds), subsequent runs are instant
- **"docker-compose: command not found"**: Install Docker Desktop or docker-compose
  - **Solution**: Install Docker Desktop which includes docker-compose
- **Missing credentials**: Ensure you enter valid credentials when prompted by VS Code MCP
- **"Process exited with code 125"**: Docker configuration issue
  - **Solution**: Ensure Docker is running and try again
- **"Initial Google authentication failed"**: Your Google ID token may be expired or invalid
- **"Token refresh failed"**: Your session may have expired, restart the server to re-authenticate with Google
- **"Invalid parameters"**: Check your input format matches the schema
- **"API Error 401"**: Your Google authentication may be invalid or expired
- **"Budget not found"**: Verify your default budget ID is correct
- **"MCP server could not be started: Process exited with code 125"**: Check Docker image name in MCP configuration

### Docker Issues

- **Port conflicts**: Make sure no other services are using the same port
- **Permission denied**: Ensure Docker is running and you have proper permissions
- **Image not found**: Build the image locally or check the registry

### VS Code Integration

- **Server not starting**: Check your MCP configuration syntax
- **Environment variables not set**: Verify your input prompts are configured
- **Agent mode not working**: Ensure you're using VS Code 1.101 or later

## Docker Hub Deployment (For Maintainers)

### Publishing to Docker Hub

The project includes npm scripts for easy Docker Hub deployment:

1. **Login to Docker Hub:**

   ```bash
   docker login
   ```

2. **Build and Push:**

   ```bash
   npm run deploy:docker
   ```

   This script will:

   - Build the Docker image with version tags
   - Push both versioned and `latest` tags to Docker Hub
   - Use the version from `package.json` automatically

3. **Pull Latest Image:**
   ```bash
   npm run docker:pull
   ```

**Alternative:** You can also use the individual scripts directly:

```bash
# Direct script access
./scripts/build-and-push.sh
./scripts/pull-image.sh
```

### Docker Hub Configuration

The Docker Hub image is published as:

- **Repository**: `elmarkou/dept-hourbooking`
- **Tags**: `latest`, `1.1.1`, etc.
- **URL**: https://hub.docker.com/r/elmarkou/dept-hourbooking

### Using Docker Hub Image

Users can now use the MCP server without any local setup:

```bash
# Pull and run directly
docker run -it --rm \
  -p 3100:3100 -p 3005:3005 \
  -e DEPT_EMPLOYEE_ID="your_id" \
  -e DEPT_CORPORATION_ID="your_corp_id" \
  -e DEPT_DEFAULT_ACTIVITY_ID="your_activity_id" \
  -e DEPT_DEFAULT_PROJECT_ID="your_project_id" \
  -e DEPT_DEFAULT_COMPANY_ID="your_company_id" \
  -e DEPT_DEFAULT_BUDGET_ID="your_budget_id" \
  elmarkou/dept-hourbooking:latest
```

Or use in Claude Desktop/VS Code MCP with zero setup required!

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with MCP Inspector
5. Submit a pull request

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

Built with ❤️ following the GitHub MCP Server pattern for seamless AI integration.

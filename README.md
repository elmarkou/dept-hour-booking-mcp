# Dept Hour Booking MCP Server

> **✅ Version 1.0.5 - Latest Release**
>
> **Current Status**: Functional with manual Google API token setup, bulk booking capabilities, and time entry deletion. Full Google OAuth2 integration in progress.
>
> **Latest Update**: Added delete hours functionality for removing time entries from the system.

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that integrates with the Dept Public API for time tracking and project management. Built following the same patterns as the [GitHub MCP Server](https://github.com/github/github-mcp-server).

## Features

- **📝 Book Hours**: Create individual time entries with automatic budget lookup
- **📅 Bulk Book Hours**: Efficiently book hours across multiple days with date range and weekday selection
- **✏️ Update Hours**: Modify existing time bookings with proper data preservation
- **�️ Delete Hours**: Remove time entries from the system with confirmation
- **�🔍 Search Budgets**: Find available budgets and projects
- **📋 Check Booked Hours**: View time entries for specific date ranges
- **🔧 Configurable**: Environment-based configuration
- **🔒 Secure**: Google ID token authentication with automatic refresh
- **🐳 Docker Ready**: Easy deployment with Docker Compose
- **🤖 AI-Ready**: Natural language interface through MCP protocol
- **⚡ One-Click Install**: Easy installation via VS Code Copilot MCP Extension

## Version 1.0.5 Release Notes

This release introduces several improvements and fixes:

- 📝 **Improved Documentation**: Expanded README with clearer setup instructions, troubleshooting, and configuration details.
- 🛠️ **Refined Bulk Booking**: Enhanced bulk booking logic for more reliable weekday selection and validation.
- 🗑️ **Delete Hours Improvements**: Added confirmation and detailed feedback when deleting time entries.
- 🔒 **Authentication Updates**: Improved Google ID token handling and error messages for authentication failures.
- 🐳 **Docker Workflow Polishing**: Streamlined Docker scripts and clarified Docker Compose usage.
- 🧪 **Testing Enhancements**: Added and updated scripts for easier MCP configuration testing.
- 🧹 **General Cleanup**: Minor bug fixes, codebase cleanup, and improved error handling throughout.

See [CHANGELOG.md](./CHANGELOG.md) for a complete list of changes.

---

### Previous Versions

## Version 1.0.4 Release Notes

This update introduces time entry deletion capabilities:

- 🗑️ **NEW: Delete Hours Tool**: Remove time entries from the system with confirmation
- ⚠️ **Safety Features**: Fetches entry details before deletion for confirmation
- 📋 **Detailed Feedback**: Shows deleted entry information for verification
- 🔒 **Secure Operation**: Uses existing authentication and validation patterns
- 💬 **Natural Language**: Supports deletion via conversational interface

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes and migration information.

## Quick Start

> **✅ ZERO SETUP REQUIRED**: Multiple options available - choose what works best for you!

### 🚀 Easiest Installation: VS Code Extension

**For the simplest setup experience:**

1. **Install the MCP Extension:**

   - Install the [Copilot MCP Extension](https://marketplace.visualstudio.com/items?itemName=AutomataLabs.copilot-mcp) from the VS Code Marketplace
   - Or search for "Copilot MCP" in VS Code Extensions

2. **Install this MCP Server:**

   - The extension provides a user-friendly interface to install and configure MCP servers
   - Simply search for "Dept Hour Booking" or use the repository URL
   - The extension handles all the configuration automatically

3. **No manual setup required** - the extension manages everything for you!

### VS Code MCP (Manual Configuration)

**⚡ FASTEST: Docker Hub Option**

1. **Clone the repository:**

   ```bash
   git clone <your-repo>
   cd dept-hour-booking
   ```

2. **Use the Docker Hub configuration:**
   - Copy `.vscode/mcp-dockerhub.json` to `.vscode/mcp.json`
   - **INSTANT SETUP**: Uses pre-built image from Docker Hub
   - **NO BUILD TIME**: Downloads ready-to-use image automatically
   - VS Code will prompt for your credentials when you first connect

**🔨 ALTERNATIVE: Local Build Option**

1. **Clone the repository:**

   ```bash
   git clone <your-repo>
   cd dept-hour-booking
   ```

2. **Use the local build configuration:**
   - The `.vscode/mcp.json` configuration is ready to use
   - **No manual setup needed** - Docker will automatically build the image on first use
   - VS Code will prompt for your credentials when you first connect

**🛠️ DEVELOPMENT: Node.js Direct**

- If you prefer Node.js over Docker, run:
  ```bash
  npm install && npm run build
  ```
- Then use `.vscode/mcp-nodejs.json` (copy to `.vscode/mcp.json`)

### Manual Setup (Optional)

Only needed if you want to pre-build or test. We provide convenient npm scripts for all tasks:

```bash
# Setup and preparation
npm run setup          # Run initial setup script
npm run setup:mcp       # Setup MCP-specific configuration

# Docker operations
npm run docker:build    # Build Docker image
npm run docker:run      # Run MCP server with Docker
npm run docker:cleanup  # Clean up Docker resources
npm run docker:pull     # Pull Docker image from registry
npm run deploy:docker   # Build and push to Docker Hub

# Development and testing
npm run build          # Build TypeScript project
npm run test:mcp       # Test MCP configurations
npm run dev:stdio      # Run in development mode
npm run dev:inspector  # Start MCP Inspector
```

**Quick commands:**

```bash
# Most common: Setup and test
npm run setup && npm run test:mcp

# Docker workflow
npm run docker:build && npm run docker:run

# Development workflow
npm run build && npm run dev:stdio
```

### VS Code MCP Configuration

The server includes three ready-to-use MCP configurations:

#### Option 1: Docker Hub (`.vscode/mcp-dockerhub.json`) - Easiest ⭐⭐⭐

- **🚀 INSTANT SETUP**: Uses pre-built Docker image from Docker Hub
- **📦 NO BUILD REQUIRED**: Downloads ready-to-use image automatically
- **🌐 UNIVERSAL**: Works anywhere with Docker, no local build needed
- **⚡ FASTEST**: Skip build time completely
- Perfect for quick starts and Copilot installations

#### Option 2: Local Docker Build (`.vscode/mcp.json`) - Recommended ⭐⭐

- **🔥 AUTOMATIC SETUP**: Builds Docker image automatically on first use
- **✅ ZERO CONFIGURATION**: Just clone and use - no manual steps required
- **🤫 CLEAN OUTPUT**: Suppresses Docker build warnings for clean MCP experience
- Uses `docker-compose` for automatic dependency management
- More isolated and consistent environment
- Perfect for development and customization

#### Option 3: Node.js-based (`.vscode/mcp-nodejs.json`) - For Development ⭐

- Uses Node.js directly, faster startup after initial build
- More reliable for local VS Code integration
- Easier debugging and development
- Requires manual `npm install && npm run build` first

**Both configurations will prompt you for credentials:**

- **Dept Client ID**: Your Dept client ID (typically "17")
- **Dept Client Secret**: Your client secret (contact Dept admin if needed)
- **Google ID Token**: Obtain from Google OAuth (see Getting Credentials section)
- **Employee ID**: Your Dept employee ID
- **Corporation ID**: Your Dept corporation ID
- **Default Activity ID, Project ID, Company ID, Budget ID**: Your default IDs

**For first-time users:**

1. Clone the repository
2. Open in VS Code with MCP enabled
3. The Docker configuration will automatically build everything on first use
4. Enter your credentials when prompted

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings (`claude_desktop_config.json`):

#### Option 1: Docker Hub (Easiest - No Build Required) ⭐⭐⭐

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
        "DEPT_CLIENT_ID=17",
        "-e",
        "DEPT_CLIENT_SECRET=<YOUR_CLIENT_SECRET>",
        "-e",
        "DEPT_GOOGLE_ID_TOKEN=<YOUR_GOOGLE_ID_TOKEN>",
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
    "dept-hour-booking": {
      "command": "docker-compose",
      "args": ["run", "--rm", "-T", "dept-hour-booking"],
      "cwd": "/absolute/path/to/your/dept-hour-booking",
      "env": {
        "DEPT_CLIENT_ID": "17",
        "DEPT_CLIENT_SECRET": "<YOUR_CLIENT_SECRET>",
        "DEPT_GOOGLE_ID_TOKEN": "<YOUR_GOOGLE_ID_TOKEN>",
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
    "dept-hour-booking": {
      "command": "node",
      "args": ["./lib/src/index.js"],
      "cwd": "/absolute/path/to/your/dept-hour-booking",
      "env": {
        "DEPT_CLIENT_ID": "17",
        "DEPT_CLIENT_SECRET": "<YOUR_CLIENT_SECRET>",
        "DEPT_GOOGLE_ID_TOKEN": "<YOUR_GOOGLE_ID_TOKEN>",
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
- **Option 2 (Local Build)**: Requires cloning repository and replacing `/absolute/path/to/your/dept-hour-booking` with actual path
- **Option 3 (Node.js)**: Requires running `npm install && npm run build` first and setting correct `cwd` path
- **Examples of absolute paths**:
  - macOS/Linux: `/Users/yourname/projects/dept-hour-booking` or `/home/yourname/dept-hour-booking`
  - Windows: `C:\\Users\\yourname\\projects\\dept-hour-booking`

## Prerequisites

1. **Docker**: Required for containerized deployment
2. **Google Cloud Project**: ⚠️ **DEPT must create a Google Cloud project** with OAuth 2.0 credentials
3. **Google ID Token**: Google OAuth token from your @deptagency.com account (requires step 2)
4. **Dept Credentials**: Client secret and account IDs from your Dept administrator

## ⚠️ Important: Google Cloud Setup Required

**This project currently requires Dept administration to set up a Google Cloud project.**

**What Dept needs to do:**

1. **Create Google Cloud Project**: Set up a new Google Cloud project for Dept MCP integrations
2. **Configure OAuth 2.0**: Create OAuth 2.0 client credentials for the application
3. **Set Authorized Domains**: Configure `@deptagency.com` as authorized domain
4. **Provide Client Credentials**: Share the OAuth client ID and client secret

**Current Status**: The authentication flow is implemented and ready, but needs proper Google Cloud project configuration to work with Dept's domain restrictions.

## Configuration

> **🚧 IN PROGRESS**: Authentication flow is implemented but requires Google Cloud project setup by Dept administration.

The server is configured through environment variables:

| Variable                   | Description                           | Required |
| -------------------------- | ------------------------------------- | -------- |
| `DEPT_CLIENT_ID`           | Dept OAuth client ID (typically "17") | Yes      |
| `DEPT_CLIENT_SECRET`       | Your Dept OAuth client secret         | Yes      |
| `DEPT_GOOGLE_ID_TOKEN`     | Google ID token from OAuth flow       | Yes      |
| `DEPT_EMPLOYEE_ID`         | Your Dept employee ID                 | Yes      |
| `DEPT_CORPORATION_ID`      | Your Dept corporation ID              | Yes      |
| `DEPT_DEFAULT_BUDGET_ID`   | Default budget ID for time entries    | Yes      |
| `DEPT_DEFAULT_ACTIVITY_ID` | Default activity ID                   | No       |
| `DEPT_DEFAULT_PROJECT_ID`  | Default project ID                    | No       |
| `DEPT_DEFAULT_COMPANY_ID`  | Default company ID                    | No       |

> **Note**: `DEPT_API_BASE_URL` and `DEPT_TOKEN_URL` are now hardcoded in the application and don't need to be set as environment variables.

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

### `book_hours_bulk`

Book time entries across multiple days in a single operation.

**Parameters:**

- `hours` (number): Hours to book per day (0.1-24)
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `description` (string): Work description for all entries
- `budgetId` (string, optional): Budget ID (auto-searches if not provided)
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
- _"Update booking 12345 to 3 hours"_
- _"Delete time entry 12345"_
- _"Remove the booking with ID 67890"_
- _"Show me details for time entry 12345"_
- _"Find all available Canva projects"_
- _"Book 6 hours daily from Monday to Friday for sprint work"_

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
docker-compose build

# Run the container
docker-compose up
```

Or manually:

```bash
# Build the image
docker build -t depthourbooking-dept-hour-booking .

# Run the container
docker run -i --rm \
  -e DEPT_CLIENT_ID="17" \
  -e DEPT_CLIENT_SECRET="your_client_secret" \
  -e DEPT_GOOGLE_ID_TOKEN="your_google_id_token" \
  -e DEPT_EMPLOYEE_ID="your_employee_id" \
  -e DEPT_CORPORATION_ID="your_corporation_id" \
  -e DEPT_DEFAULT_BUDGET_ID="your_budget_id" \
  depthourbooking-dept-hour-booking
```

## Project Structure

```
├── src/
│   └── index.ts              # Main MCP server implementation
├── scripts/
│   ├── setup.sh              # General setup script
│   ├── setup-mcp.sh          # Automated MCP setup script
│   ├── test-mcp.sh           # Test script for MCP configurations
│   ├── run-mcp.sh            # Run MCP server with Docker
│   ├── run-mcp-docker.sh     # Run MCP server directly with Docker
│   ├── build-and-push.sh     # Build and push Docker image
│   ├── pull-image.sh         # Pull Docker image from registry
│   └── docker-cleanup.sh     # Clean up Docker resources
├── .vscode/
│   ├── mcp.json              # Docker-based MCP configuration
│   ├── mcp-dockerhub.json    # Docker Hub-based MCP configuration
│   ├── mcp-nodejs.json       # Node.js-based MCP configuration
│   └── tasks.json            # VS Code tasks including setup
├── .env.example              # Environment configuration template
├── .gitignore               # Git ignore rules
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose for development
├── package.json             # Node.js dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
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
3. **Google ID Token**: Obtain from Google OAuth flow (see below)
4. **Employee/Corporation IDs**: Available in your Dept profile or from administrator

### Getting a Google ID Token

> **⚠️ Currently Blocked**: This step requires Dept to create a Google Cloud project first.

**🎯 Method 1 - Browser Developer Tools (Temporary Workaround):**

1. Go to https://time.deptagency.com
2. Sign in with your @deptagency.com account
3. Open Developer Tools (F12) → Network tab
4. Look for requests to authenticate endpoints
5. Find the Google ID token in the request/response data

**🎯 Method 2 - Google Cloud OAuth (Requires Dept Setup):**

_This method will be available once Dept creates the Google Cloud project:_

1. Use Google OAuth 2.0 with parameters from Dept's Google Cloud project:

   - **Client ID**: `[TO BE PROVIDED BY DEPT]`
   - **Scope**: `openid email profile`
   - **Response Type**: `id_token`
   - **Redirect URI**: `[TO BE CONFIGURED BY DEPT]`

2. The resulting `id_token` is what you need for `DEPT_GOOGLE_ID_TOKEN`

**📋 What Dept Administration Needs to Provide:**

- Google Cloud project OAuth 2.0 client ID
- Authorized redirect URIs for the OAuth flow
- Domain verification for `@deptagency.com` emails
- Client secret for the OAuth application

> **Note**: The current implementation accepts any valid Google ID token through the `DEPT_GOOGLE_ID_TOKEN` environment variable. The source of this token (whether from time.deptagency.com or a dedicated Google Cloud project) is flexible, but a dedicated Google Cloud project would provide better control, security, and reliability for the MCP server.

## Troubleshooting

### Common Issues

- **"Building Docker image... (first time)"**: This is normal! Docker is automatically building the image for you
- **Long first startup**: First run builds the Docker image (takes 30-60 seconds), subsequent runs are instant
- **"docker-compose: command not found"**: Install Docker Desktop or docker-compose
  - **Solution**: Install Docker Desktop which includes docker-compose
- **Missing credentials**: Ensure you enter valid credentials when prompted by VS Code MCP
- **"Process exited with code 125"**: Docker configuration issue
  - **Solution**: Ensure Docker is running and try again
- **"Missing required credentials"**: Make sure you've set `DEPT_CLIENT_SECRET` and `DEPT_GOOGLE_ID_TOKEN`
- **"Initial Google authentication failed"**: Your Google ID token may be expired or invalid, or Google Cloud project is not set up
- **"Token refresh failed"**: Your session may have expired, restart the server to re-authenticate with Google
- **"Invalid parameters"**: Check your input format matches the schema
- **"API Error 401"**: Your Google authentication may be invalid or expired
- **"Budget not found"**: Verify your default budget ID is correct
- **"MCP server could not be started: Process exited with code 125"**: Check Docker image name in MCP configuration
- **Google OAuth issues**: ⚠️ **Most likely cause**: Dept needs to create Google Cloud project for proper OAuth setup

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
- **Tags**: `latest`, `1.0.2`, etc.
- **URL**: https://hub.docker.com/r/elmarkou/dept-hourbooking

### Using Docker Hub Image

Users can now use the MCP server without any local setup:

```bash
# Pull and run directly
docker run -it --rm \
  -e DEPT_CLIENT_ID="17" \
  -e DEPT_CLIENT_SECRET="your_secret" \
  -e DEPT_GOOGLE_ID_TOKEN="your_token" \
  -e DEPT_EMPLOYEE_ID="your_id" \
  -e DEPT_CORPORATION_ID="your_corp_id" \
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

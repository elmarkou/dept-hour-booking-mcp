# Dept Hour Booking MCP Server

> **✅ Version 1.0.1 - Latest Release**
>
> **Current Status**: Fully functional with Google OAuth2 authentication. Production-ready for use with Google Cloud project.
>
> **Latest Update**: Critical bug fix for data corruption in time entry updates.

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that integrates with the Dept Public API for time tracking and project management. Built following the same patterns as the [GitHub MCP Server](https://github.com/github/github-mcp-server).

## Features

- **📝 Book Hours**: Create time entries with automatic budget lookup
- **✏️ Update Hours**: Modify existing time bookings with proper data preservation
- **🔍 Search Budgets**: Find available budgets and projects
- **� Get Hour Details**: Retrieve individual time booking records
- **�🔧 Configurable**: Environment-based configuration
- **🔒 Secure**: Google ID token authentication with automatic refresh
- **🐳 Docker Ready**: Easy deployment with Docker Compose
- **🤖 AI-Ready**: Natural language interface through MCP protocol

## Version 1.0.1 Release Notes

This critical update includes:

- 🔥 **CRITICAL BUG FIX**: Fixed data corruption in `update_hours` endpoint
- ✅ **Proper PATCH Semantics**: Time entry updates now preserve unmodified fields
- ✅ **New Tool**: `get_booked_hour` for retrieving individual time booking records
- ✅ **Enhanced Docker Management**: Improved container cleanup and duplicate detection
- ✅ **Better Error Handling**: More robust validation and user feedback
- ✅ **Data Integrity**: Eliminated hardcoded fallback values that corrupted existing data

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes and migration information.

## Quick Start

### Option 1: Docker (Recommended)

1. **Clone and setup:**

   ```bash
   git clone <your-repo>
   cd dept-hour-booking
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your credentials (see Configuration section)
   ```

3. **Start with Docker Compose:**

   ```bash
   docker-compose up
   ```

4. **Configure VS Code:**
   The server is now running and ready to use with the MCP configuration in `.vscode/mcp.json`

### Option 2: Local Development

1. **Install dependencies:**

   ```bash
   npm install
   npm run build
   ```

2. **Configure and run:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   node lib/src/index.js
   ```

### VS Code MCP Configuration

The server includes a ready-to-use MCP configuration in `.vscode/mcp.json`. This configuration will prompt you for the required credentials when you use the MCP server.

**Required inputs when prompted:**

- **Dept Client ID**: Your Dept client ID (typically "17")
- **Dept Client Secret**: Your client secret (contact Dept admin if needed)
- **Google ID Token**: Obtain from Google OAuth (see Getting Credentials section)
- **Employee ID**: Your Dept employee ID
- **Corporation ID**: Your Dept corporation ID
- **Default Activity ID, Project ID, Company ID, Budget ID**: Your default IDs

The configuration automatically handles Docker container management and environment variable passing.

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings (`claude_desktop_config.json`):

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
        "DEPT_CLIENT_ID",
        "-e",
        "DEPT_CLIENT_SECRET",
        "-e",
        "DEPT_GOOGLE_ID_TOKEN",
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
        "depthourbooking-dept-hour-booking"
      ],
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

### `get_booked_hour`

Get details of a specific booked hour entry by ID.

**Parameters:**

- `id` (string): Time entry ID to retrieve

**Example:**

```json
{
  "id": "12345"
}
```

## Natural Language Usage

Once configured, you can interact with the server using natural language:

- _"Book 2 hours for NDH-2286 development work today"_
- _"Search for budgets containing 'Medela'"_
- _"Update booking 12345 to 3 hours"_
- _"Show me details for time entry 12345"_
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
│   └── index.ts          # Main MCP server implementation
├── .vscode/
│   └── mcp.json          # VS Code MCP configuration
├── .env.example          # Environment configuration template
├── .gitignore           # Git ignore rules
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose for development
├── package.json         # Node.js dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
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

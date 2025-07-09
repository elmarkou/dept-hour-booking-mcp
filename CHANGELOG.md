# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2025-07-09

### Changed

- 📝 **Improved Documentation**: Expanded README with clearer setup instructions, troubleshooting, and configuration details.
- 🛠️ **Refined Bulk Booking**: Enhanced bulk booking logic for more reliable weekday selection and validation.
- 🗑️ **Delete Hours Improvements**: Added confirmation and detailed feedback when deleting time entries.
- 🔒 **Authentication Updates**: Improved Google ID token handling and error messages for authentication failures.
- 🐳 **Docker Workflow Polishing**: Streamlined Docker scripts and clarified Docker Compose usage.
- 🧪 **Testing Enhancements**: Added and updated scripts for easier MCP configuration testing.
- 🧹 **General Cleanup**: Minor bug fixes, codebase cleanup, and improved error handling throughout.

## [1.0.4] - 2025-07-08

### Added

- **NEW FEATURE**: `delete_hours` tool for removing time entries from the system
- **Safety Features**: Fetches existing record details before deletion for confirmation
- **Comprehensive Feedback**: Shows deleted entry information including date, hours, description, project, and budget
- **Error Handling**: Validates that the time entry exists before attempting deletion
- **Natural Language Support**: Supports deletion via conversational interface with phrases like "delete time entry X"

### Changed

- Enhanced natural language examples to include deletion operations
- Updated documentation with comprehensive delete tool usage and safety warnings
- Improved tool registration to include the new delete functionality

### Technical Details

- Added `DeleteHoursSchema` validation schema for delete requests
- Implemented safe deletion with pre-fetch validation
- Enhanced error handling for non-existent time entries
- Maintains consistency with existing tool patterns and authentication

## [1.0.3] - 2025-07-07

### Added

- **NEW FEATURE**: `book_hours_bulk` tool for efficient multi-day time booking
- **Date Range Support**: Book hours across multiple days with single API call
- **Weekday Selection**: Configurable weekday inclusion (Monday-Friday by default)
- **Smart Defaults**: Automatic budget lookup and sensible weekday configuration
- **Flexible Scheduling**: Support for custom weekday patterns including weekends

### Changed

- Enhanced natural language interface to support bulk booking requests
- Updated documentation with comprehensive bulk booking examples
- Improved API efficiency by reducing multiple single-day calls to one bulk operation

### Technical Details

- Added `BookHoursBulkSchema` validation schema for bulk booking requests
- Implemented date range iteration with weekday filtering logic
- Enhanced tool registration system to include new bulk booking capability
- Maintains backward compatibility with existing `book_hours` tool

## [1.0.2] - 2025-07-07

### Fixed

- **ZERO SETUP REQUIRED**: Docker configuration now automatically builds images on first use
- Removed hardcoded paths from MCP configurations for universal compatibility
- Fixed "Unable to find image" error when installing via VS Code MCP/Copilot
- **CLEAN MCP EXPERIENCE**: Suppressed Docker build warnings that appeared as MCP parsing errors

### Changed

- MCP configurations now use `${workspaceFolder}` for portable paths
- Simplified installation process - just clone and use
- Updated documentation to reflect automatic setup
- Selective .gitignore for VS Code files (keeps important MCP configs, excludes personal settings)

### Added

- **Organized Scripts**: All shell scripts moved to `scripts/` directory
- **NPM Scripts**: Added convenient npm scripts for all dev/ops tasks:
  - `npm run setup` - Initial setup
  - `npm run docker:build` - Build Docker image
  - `npm run docker:run` - Run with Docker
  - `npm run deploy:docker` - Build and push to Docker Hub
  - `npm run test:mcp` - Test MCP configurations
  - And many more for complete workflow automation

## [1.0.1] - 2025-07-07

### Fixed

- **CRITICAL**: Fixed data corruption bug in `update_hours` endpoint
- Implemented proper PATCH semantics for time entry updates
- Fields not specified in update requests now preserve their original values
- Removed hardcoded fallback values that were corrupting existing data

### Added

- `get_booked_hour` tool for retrieving individual time booking records
- Enhanced Docker cleanup scripts to handle multiple container instances
- Improved container management and duplicate detection

### Changed

- `update_hours` now fetches existing records before applying updates
- Enhanced error handling and validation for update operations
- Improved user feedback showing exactly what fields were changed

## [1.0.0] - 2025-07-05

### Added

- Google OAuth2 authentication with automatic token refresh
- Budget search functionality (`search_budget` tool)
- Time entry booking (`book_hours` tool)
- Time entry updates (`update_hours` tool)
- Docker and Docker Compose support
- VS Code MCP configuration files
- Comprehensive documentation and setup guide

### Changed

- Removed all deprecated authentication methods and environment variables
- Cleaned up project structure and removed unused files
- Updated all configuration files to use current environment variables only
- Standardized documentation and made it production-ready

### Fixed

- Authentication flow now uses secure Google OAuth2 exclusively
- All configuration files are consistent and up-to-date
- Docker configuration properly reflects build and runtime requirements

## [0.0.1] - 2025-07-01

### Added

- Initial commit with basic MCP server structure
- Basic TypeScript setup and configuration
- Initial authentication implementation (deprecated)
- Basic project structure and dependencies

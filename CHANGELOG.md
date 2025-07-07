# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

#!/bin/bash
# Build the Docker image quietly if needed
docker-compose build --quiet dept-hour-booking >/dev/null 2>&1
# Run the MCP server
exec docker-compose run --rm -T dept-hour-booking

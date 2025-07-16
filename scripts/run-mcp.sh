#!/bin/bash
# Build the Docker image quietly if needed
docker-compose build --quiet dept-hour-booking >/dev/null 2>&1
# Run the MCP server with port publishing and stdio connectivity
exec docker-compose run --rm -T -i -p 3000:3000 -p 3005:3005 dept-hour-booking

#!/bin/bash

# Docker cleanup script for Dept Hour Booking MCP Server
# This script helps clean up multiple containers that might be created

echo "🧹 Cleaning up Docker containers and images for Dept Hour Booking..."

# Stop all containers related to this project
echo "Stopping running containers..."
docker-compose down 2>/dev/null || true

# Force stop and remove ALL containers using our specific image
echo "🔍 Finding containers with depthourbooking-dept-hour-booking image..."
ALL_CONTAINERS=$(docker ps -aq --filter "ancestor=depthourbooking-dept-hour-booking" 2>/dev/null || true)
if [ ! -z "$ALL_CONTAINERS" ]; then
    echo "⚠️  Found containers, stopping and removing them..."
    docker stop $ALL_CONTAINERS 2>/dev/null || true
    docker rm $ALL_CONTAINERS 2>/dev/null || true
    echo "✅ Removed containers: $ALL_CONTAINERS"
else
    echo "ℹ️  No containers found with depthourbooking-dept-hour-booking image"
fi

# Remove all stopped containers with 'dept' or 'hourbooking' in the name
echo "Removing other stopped containers..."
docker container prune -f

# Remove containers specifically related to this project by name
DEPT_CONTAINERS=$(docker ps -aq --filter "name=dept" 2>/dev/null || true)
HOUR_CONTAINERS=$(docker ps -aq --filter "name=hourbooking" 2>/dev/null || true)

if [ ! -z "$DEPT_CONTAINERS" ]; then
    echo "Removing containers with 'dept' in name..."
    docker rm -f $DEPT_CONTAINERS 2>/dev/null || true
fi

if [ ! -z "$HOUR_CONTAINERS" ]; then
    echo "Removing containers with 'hourbooking' in name..."
    docker rm -f $HOUR_CONTAINERS 2>/dev/null || true
fi

# Remove unused images (optional - uncomment if you want to remove unused images)
# echo "Removing unused images..."
# docker image prune -f

# Remove dangling images related to this project
echo "Removing dangling images..."
docker images -f "dangling=true" -q | xargs -r docker rmi

# Show current status
echo "✅ Cleanup complete!"
echo "Current containers:"
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

echo ""
echo "Current images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

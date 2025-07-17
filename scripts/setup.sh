#!/bin/bash

# Dept Hour Booking MCP Server Setup Script
# This script sets up and runs the Docker container properly

set -e

echo "🚀 Setting up Dept Hour Booking MCP Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Clean up any existing containers to avoid conflicts
echo "🧹 Cleaning up existing containers..."
docker-compose down 2>/dev/null || true

# Force stop and remove any running containers with our image name
echo "🔍 Checking for duplicate containers..."
RUNNING_CONTAINERS=$(docker ps -q --filter "ancestor=depthourbooking-dept-hourbooking" 2>/dev/null || true)
if [ ! -z "$RUNNING_CONTAINERS" ]; then
    echo "⚠️  Found running containers, stopping them..."
    docker stop $RUNNING_CONTAINERS 2>/dev/null || true
    docker rm $RUNNING_CONTAINERS 2>/dev/null || true
fi

# Also clean up any exited containers with our image
EXITED_CONTAINERS=$(docker ps -aq --filter "ancestor=depthourbooking-dept-hourbooking" 2>/dev/null || true)
if [ ! -z "$EXITED_CONTAINERS" ]; then
    echo "🗑️  Removing stopped containers..."
    docker rm $EXITED_CONTAINERS 2>/dev/null || true
fi

# Check if image exists
IMAGE_NAME="depthourbooking-dept-hourbooking"
if docker images --format "{{.Repository}}" | grep -q "^${IMAGE_NAME}$"; then
    echo "📦 Docker image exists. Starting container..."
    docker-compose up -d
else
    echo "🏗️  Docker image not found. Building and starting container..."
    docker-compose up --build -d
fi

# Show status
echo "✅ Container started successfully!"
echo "Container status:"
docker-compose ps

# Check for multiple containers with the same image (potential issue detection)
CONTAINER_COUNT=$(docker ps -q --filter "ancestor=depthourbooking-dept-hourbooking" | wc -l | tr -d ' ')
if [ "$CONTAINER_COUNT" -gt 1 ]; then
    echo ""
    echo "⚠️  WARNING: Found $CONTAINER_COUNT containers running with the same image!"
    echo "This might cause conflicts. Consider running: ./docker-cleanup.sh"
    echo "Running containers:"
    docker ps --filter "ancestor=depthourbooking-dept-hourbooking" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

echo ""
echo "📋 Useful commands:"
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo "🔄 Rebuild: docker-compose up --build -d"
echo "🧹 Cleanup: ./docker-cleanup.sh"
echo "🔍 Check containers: docker ps --filter 'ancestor=depthourbooking-dept-hourbooking'"
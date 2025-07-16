#!/bin/bash

# Auto-build script for MCP Docker image
# This script ensures the Docker image exists before running

IMAGE_NAME="depthourbooking-dept-hour-booking:latest"

# Check if Docker image exists
if ! docker image inspect "$IMAGE_NAME" &> /dev/null; then
    echo "Docker image not found. Building..."
    
    # Try docker-compose first
    if command -v docker-compose &> /dev/null; then
        echo "Using docker-compose to build..."
        docker-compose build
    else
        echo "Using docker build..."
        docker build -t "$IMAGE_NAME" .
    fi
    
    if [ $? -eq 0 ]; then
        echo "Docker image built successfully!"
    else
        echo "Failed to build Docker image"
        exit 1
    fi
else
    echo "Docker image exists, skipping build"
fi

# Run the container
exec docker run -i --rm \
    -e "DEPT_CLIENT_ID=${DEPT_CLIENT_ID}" \
    -e "DEPT_CLIENT_SECRET=${DEPT_CLIENT_SECRET}" \
    -e "DEPT_EMPLOYEE_ID=${DEPT_EMPLOYEE_ID}" \
    -e "DEPT_CORPORATION_ID=${DEPT_CORPORATION_ID}" \
    -e "DEPT_DEFAULT_ACTIVITY_ID=${DEPT_DEFAULT_ACTIVITY_ID}" \
    -e "DEPT_DEFAULT_PROJECT_ID=${DEPT_DEFAULT_PROJECT_ID}" \
    -e "DEPT_DEFAULT_COMPANY_ID=${DEPT_DEFAULT_COMPANY_ID}" \
    -e "DEPT_DEFAULT_BUDGET_ID=${DEPT_DEFAULT_BUDGET_ID}" \
    "$IMAGE_NAME"

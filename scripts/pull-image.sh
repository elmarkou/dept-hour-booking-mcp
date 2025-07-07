#!/bin/bash

# Docker Hub configuration
DOCKER_USERNAME="elmarkou" # Replace with your Docker Hub username
IMAGE_NAME="dept-hourbooking"
LATEST_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

echo "📥 Pulling latest Docker image from Docker Hub..."
echo "🏷️  Image: ${LATEST_IMAGE_NAME}"

# Pull the latest image
docker pull "${LATEST_IMAGE_NAME}"

if [ $? -ne 0 ]; then
    echo "❌ Pull failed! Image might not exist on Docker Hub yet."
    echo "   Run ./build-and-push.sh first to publish the image."
    exit 1
fi

echo "✅ Successfully pulled: ${LATEST_IMAGE_NAME}"
echo ""
echo "🎉 You can now use the MCP server with Docker Hub image!"

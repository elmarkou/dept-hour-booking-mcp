#!/bin/bash

# Docker Hub configuration
DOCKER_USERNAME="elmarkou" # Replace with your Docker Hub username
IMAGE_NAME="dept-hourbooking"
VERSION=$(node -p "require('./package.json').version")

# Full image name
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
LATEST_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

echo "🚀 Building and pushing Docker image..."
echo "📦 Image: ${FULL_IMAGE_NAME}"
echo "🏷️  Latest: ${LATEST_IMAGE_NAME}"

# Build the image
echo "🔨 Building Docker image..."
docker build -t "${FULL_IMAGE_NAME}" -t "${LATEST_IMAGE_NAME}" .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push "${FULL_IMAGE_NAME}"
docker push "${LATEST_IMAGE_NAME}"

if [ $? -ne 0 ]; then
    echo "❌ Push failed! Make sure you're logged in to Docker Hub:"
    echo "   docker login"
    exit 1
fi

echo "✅ Successfully pushed:"
echo "   ${FULL_IMAGE_NAME}"
echo "   ${LATEST_IMAGE_NAME}"
echo ""
echo "🎉 Users can now use: ${LATEST_IMAGE_NAME}"

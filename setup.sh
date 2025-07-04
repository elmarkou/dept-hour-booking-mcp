#!/bin/bash

# Dept Hour Booking MCP Server Setup Script

echo "🏢 Dept Hour Booking MCP Server Setup"
echo "====================================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is installed and running"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env with your Dept API credentials before running the server"
else
    echo "✅ .env file already exists"
fi

# Build Docker image
echo "🐳 Building Docker image..."
if docker build -t dept-hour-booking-mcp-server .; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Failed to build Docker image"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Dept API credentials"
echo "2. Test the server: docker run -i --rm --env-file .env dept-hour-booking-mcp-server"
echo "3. Configure in VS Code using the .vscode/mcp.json template"
echo ""
echo "For VS Code integration:"
echo "- Copy the configuration from .vscode/mcp.json"
echo "- Add it to your VS Code MCP settings"
echo "- Enable Agent mode and start chatting!"

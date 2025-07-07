#!/bin/bash

# Dept Hour Booking MCP Server Setup Script

echo "🚀 Setting up Dept Hour Booking MCP Server..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the TypeScript project
echo "🔨 Building TypeScript project..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker-compose build

echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy .env.example to .env and configure your credentials"
echo "2. Choose your MCP configuration:"
echo "   - For Docker: Use .vscode/mcp.json"
echo "   - For Node.js: Use .vscode/mcp-nodejs.json"
echo "3. Configure VS Code MCP or Claude Desktop with your chosen configuration"
echo ""
echo "📖 See README.md for detailed configuration instructions"

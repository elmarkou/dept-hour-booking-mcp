#!/bin/bash

# Test script to verify MCP configurations are working

echo "🧪 Testing MCP configurations..."

# Test Docker-compose configuration
echo "Testing Docker-compose configuration..."
if docker-compose run --rm -T dept-hourbooking --version > /dev/null 2>&1; then
    echo "✅ Docker-compose configuration is working"
else
    echo "❌ Docker-compose configuration failed"
    exit 1
fi

# Test Node.js configuration
echo "Testing Node.js configuration..."
if node ./lib/src/index.js --version > /dev/null 2>&1; then
    echo "✅ Node.js configuration is working"
else
    echo "❌ Node.js configuration failed - make sure you ran 'npm run build'"
    exit 1
fi

echo "✅ All MCP configurations are working!"
echo "🎯 You can now use either:"
echo "   - .vscode/mcp.json (Docker-based)"
echo "   - .vscode/mcp-nodejs.json (Node.js-based)"

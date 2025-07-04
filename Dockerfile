# Use Node.js 20 Alpine for smaller image size (MCP SDK requires Node 20+)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcp -u 1001

# Change ownership to non-root user
RUN chown -R mcp:nodejs /app
USER mcp

# Expose port (though we'll primarily use stdio)
EXPOSE 3000

# Default command runs the MCP server in stdio mode
CMD ["node", "./lib/src/index.js"]

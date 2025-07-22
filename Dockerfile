# Multi-stage build for smaller final image
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies for building
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy .env file for environment variables
COPY .env ./

# Install ONLY production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/lib ./lib

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Change ownership to non-root user
RUN chown -R mcp:nodejs /app

# Switch to non-root user
USER mcp

# Set environment variables to suppress dotenv output
ENV DOCKER_CONTAINER=true
ENV DOTENV_CONFIG_DEBUG=false
ENV NODE_ENV=production

EXPOSE 3100
EXPOSE 3005

# Default command runs the MCP server in stdio mode
CMD ["node", "./lib/src/index.js"]

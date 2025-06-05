# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install Python and build dependencies for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage - Using Playwright's base image
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

# Install Node.js 18
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4242
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Copy package files and install production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Install only Chrome browser
RUN npx playwright install --with-deps chromium

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy configuration files
COPY --from=builder /app/package.json ./

# Create data directory
RUN mkdir -p /app/data

# Expose the application port
EXPOSE 4242

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4242/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
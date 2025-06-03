# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    chromium \
    nano \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    ttf-opensans \
    dbus \
    xvfb \
    procps \
    xorg-server


ENV NODE_ENV=production
ENV PORT=4242

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy configuration files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.puppeteerrc.cjs ./

# Create data directory
RUN mkdir -p /app/data

# Install Puppeteer
RUN yarn puppeteer-install

# Expose the application port
EXPOSE 4242

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4242/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]

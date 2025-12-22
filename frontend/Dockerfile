# Frontend Dockerfile for Production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better cache
COPY package*.json ./

# Install dependencies with clean cache
# Using npm install instead of npm ci to handle lock file mismatches
RUN npm install --prefer-offline --no-audit --progress=false && \
    npm cache clean --force

# Copy source code
# .dockerignore already excludes unnecessary files
COPY . .

# Set build-time environment variable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js application with increased timeout and memory
# Set NODE_OPTIONS to increase memory and disable telemetry
ENV NODE_OPTIONS="--max-old-space-size=6144"
ENV NEXT_TELEMETRY_DISABLED=1
# Increase build timeout for complex pages
ENV NEXT_STATIC_GENERATION_TIMEOUT=600
# Disable type checking and linting during build for faster builds
ENV SKIP_ENV_VALIDATION=true
# Run build with optimizations
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Note: Firmware files will be mounted via volume in docker-compose.prod.yml

USER nextjs

# Expose port
EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Start application
CMD ["node", "server.js"]


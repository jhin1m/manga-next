# Production-ready Dockerfile for NextJS 15 Manga Website
# Supports pnpm 8.0.0+, Prisma, PostgreSQL, and multi-stage builds

# ================================
# Dependencies Stage
# ================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install pnpm globally (use version compatible with lockfile)
RUN npm install -g pnpm@10.7.0

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile --production=false

# Generate Prisma client
RUN npx prisma generate

# ================================
# Builder Stage
# ================================
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.7.0

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma/

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV DATABASE_URL "postgresql://dummy:dummy@dummy:5432/dummy"

# Build the application
RUN pnpm build

# ================================
# Production Stage
# ================================
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pnpm for production
RUN npm install -g pnpm@10.7.0

# Copy package files for production dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --production=true

# Generate Prisma client in production
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Database initialization script
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Start the application
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]

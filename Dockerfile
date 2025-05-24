# Use Node.js 20 Alpine
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies first (without frozen lockfile for Railway compatibility)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]

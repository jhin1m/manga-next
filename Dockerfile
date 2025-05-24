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

# Copy Prisma schema before installing dependencies (needed for postinstall)
COPY prisma ./prisma

# Install dependencies first (without frozen lockfile for Railway compatibility)
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client after dependencies are installed
RUN pnpm prisma generate

# Copy rest of source code
COPY . .

# Set build-time environment variables
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
ENV NEXTAUTH_SECRET="dummy-secret-for-build"
ENV NEXTAUTH_URL="http://localhost:3000"

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]

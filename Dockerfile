# Use Node.js 20 Alpine
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.7.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Create optimized .npmrc for Docker
RUN echo "auto-install-peers=true" > .npmrc && \
    echo "package-lock=false" >> .npmrc && \
    echo "strict-ssl=false" >> .npmrc

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

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
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["pnpm", "start"]

#!/bin/bash

# Exit on any error
set -e

echo "Starting Railway deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL is not set"
fi

# Run Prisma migrations if DATABASE_URL is available
if [ ! -z "$DATABASE_URL" ]; then
    echo "Running Prisma migrations..."
    npx prisma migrate deploy
fi

# Start the application
echo "Starting Next.js application..."
exec "$@"

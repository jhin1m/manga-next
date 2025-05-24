#!/bin/bash

# Exit on any error
set -e

echo "Railway deployment: Running Prisma migrations..."

# Run Prisma migrations if DATABASE_URL is available
if [ ! -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL found, running migrations..."
    npx prisma migrate deploy
    echo "Migrations completed successfully"
else
    echo "Warning: DATABASE_URL not set, skipping migrations"
fi

echo "Railway deployment setup complete"

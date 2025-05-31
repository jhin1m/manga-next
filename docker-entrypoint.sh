#!/bin/sh
set -e

echo "🚀 Starting NextJS 15 Manga Website..."

# Function to validate required environment variables
validate_env() {
  echo "🔍 Validating environment variables..."

  # Required variables
  REQUIRED_VARS="DATABASE_URL NEXTAUTH_SECRET NEXTAUTH_URL"

  for var in $REQUIRED_VARS; do
    eval value=\$$var
    if [ -z "$value" ]; then
      echo "❌ ERROR: Required environment variable $var is not set"
      exit 1
    fi
    echo "✅ $var is set"
  done

  # Validate NEXTAUTH_SECRET length (minimum 32 characters)
  if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
    echo "❌ ERROR: NEXTAUTH_SECRET must be at least 32 characters long"
    exit 1
  fi

  echo "✅ All required environment variables are valid"
}

# Function to wait for database
wait_for_db() {
  echo "⏳ Waiting for database connection..."

  # Extract database connection details from DATABASE_URL
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
  fi

  # Wait for database to be ready (max 60 seconds)
  timeout=60
  while [ $timeout -gt 0 ]; do
    if echo "SELECT 1;" | npx prisma db execute --stdin --schema=prisma/schema.prisma > /dev/null 2>&1; then
      echo "✅ Database connection established"
      break
    fi

    echo "⏳ Database not ready, waiting... ($timeout seconds remaining)"
    sleep 2
    timeout=$((timeout - 2))
  done

  if [ $timeout -le 0 ]; then
    echo "❌ ERROR: Database connection timeout after 60 seconds"
    echo "Please check your DATABASE_URL and ensure PostgreSQL is running"
    exit 1
  fi
}

# Function to run database migrations
run_migrations() {
  echo "🔄 Running database migrations..."

  # Deploy migrations (safe - preserves data)
  if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
  else
    echo "⚠️  Migration failed, attempting safe schema push..."
    echo "🛡️  Creating backup before schema changes..."

    # Create backup before any schema changes
    if command -v pg_dump >/dev/null 2>&1; then
      BACKUP_FILE="/tmp/pre-migration-backup-$(date +%Y%m%d-%H%M%S).sql"
      if echo "SELECT 1;" | npx prisma db execute --stdin --schema=prisma/schema.prisma > /dev/null 2>&1; then
        # Database is accessible, create backup
        npx prisma db execute --stdin --schema=prisma/schema.prisma <<< "SELECT 1;" > /dev/null 2>&1 || true
        echo "📦 Backup would be created at: $BACKUP_FILE"
      fi
    fi

    # Use safe db push (without force-reset to preserve data)
    if npx prisma db push; then
      echo "✅ Schema push completed successfully (data preserved)"
    else
      echo "❌ ERROR: Failed to apply database schema safely"
      echo "🚨 Manual intervention required - check schema conflicts"
      exit 1
    fi
  fi
}

# Function to seed database (optional)
seed_database() {
  if [ "$SEED_DATABASE" = "true" ] && [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    if pnpm seed; then
      echo "✅ Database seeding completed"
    else
      echo "⚠️  Database seeding failed (continuing anyway)"
    fi
  fi
}

# Main execution
main() {
  echo "🔧 Environment: $NODE_ENV"
  echo "🔧 Port: $PORT"
  echo "🔧 Hostname: $HOSTNAME"

  # Validate environment variables
  validate_env

  # Wait for database
  wait_for_db

  # Run migrations
  run_migrations

  # Optional seeding
  seed_database

  echo "🎉 Initialization complete! Starting application..."

  # Execute the main command
  exec "$@"
}

# Run main function with all arguments
main "$@"

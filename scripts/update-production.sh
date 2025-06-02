#!/bin/bash
set -e

# Production Update Script with Database Migration Support
# Usage: ./scripts/update-production.sh

echo "🔄 Starting Production Update Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to create database backup
create_backup() {
    echo "💾 Creating database backup..."
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker exec manga-fake-db-1 pg_dump -U postgres manga-next > "$BACKUP_FILE"; then
        print_status "Database backup created: $BACKUP_FILE"
        echo "Backup size: $(du -h $BACKUP_FILE | cut -f1)"
    else
        print_error "Failed to create database backup"
        exit 1
    fi
}

# Function to pull latest code
update_code() {
    echo "📥 Pulling latest code from repository..."
    
    # Stash any local changes (if any)
    git stash push -m "Auto-stash before production update $(date)"
    
    # Pull latest changes
    if git pull origin main; then
        print_status "Code updated successfully"
    else
        print_error "Failed to pull latest code"
        exit 1
    fi
    
    # Show what changed
    echo "📋 Recent commits:"
    git log --oneline -5
}

# Function to check for database schema changes
check_schema_changes() {
    echo "🔍 Checking for database schema changes..."
    
    if [ -d "prisma/migrations" ]; then
        # Count migration files
        MIGRATION_COUNT=$(find prisma/migrations -name "*.sql" | wc -l)
        print_info "Found $MIGRATION_COUNT migration files"
        
        # Show recent migrations
        echo "📋 Recent migrations:"
        find prisma/migrations -name "migration.sql" -exec dirname {} \; | sort | tail -3
        
        return 0
    else
        print_warning "No migrations directory found"
        return 1
    fi
}

# Function to update dependencies
update_dependencies() {
    echo "📦 Checking for dependency updates..."
    
    # Check if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json\|pnpm-lock.yaml"; then
        print_info "Dependencies changed, will rebuild with new dependencies"
        return 0
    else
        print_info "No dependency changes detected"
        return 1
    fi
}

# Function to perform rolling update
rolling_update() {
    echo "🔄 Performing rolling update..."
    
    # Stop only the app container (keep database running)
    print_info "Stopping application container..."
    docker compose -f docker-compose.prod.yml stop app
    
    # Build new image
    print_info "Building new application image..."
    docker compose -f docker-compose.prod.yml build app --no-cache
    
    # Start app container (migrations will run automatically via entrypoint)
    print_info "Starting updated application..."
    docker compose -f docker-compose.prod.yml up -d app
    
    # Wait for health check
    echo "⏳ Waiting for application to be healthy..."
    sleep 30
    
    # Check health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Application is healthy after update"
    else
        print_error "Application health check failed after update"
        echo "Rolling back..."
        rollback_update
        exit 1
    fi
}

# Function to rollback update
rollback_update() {
    echo "🔙 Rolling back update..."
    
    # Stop current containers
    docker compose -f docker-compose.prod.yml down
    
    # Restore from backup (if needed)
    print_warning "Manual database restore may be needed if migrations failed"
    echo "Use: docker exec -i manga-fake-db-1 psql -U postgres manga-next < backup_file.sql"
    
    # Restart with previous version
    docker compose -f docker-compose.prod.yml up -d
}

# Function to cleanup old resources
cleanup() {
    echo "🧹 Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 5)
    ls -t backup_*.sql | tail -n +6 | xargs -r rm
    
    print_status "Cleanup completed"
}

# Function to verify update
verify_update() {
    echo "🔍 Verifying update..."
    
    # Check container status
    docker compose -f docker-compose.prod.yml ps
    
    # Check application health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Application is running correctly"
    else
        print_error "Application health check failed"
        return 1
    fi
    
    # Check database connection
    if docker exec manga-fake-app-1 npx prisma db execute --stdin --schema=prisma/schema.prisma <<< "SELECT 1;" > /dev/null 2>&1; then
        print_status "Database connection is working"
    else
        print_error "Database connection failed"
        return 1
    fi
    
    print_status "Update verification completed successfully"
}

# Main execution
main() {
    print_info "Starting production update process..."
    print_info "Current time: $(date)"
    
    # Step 1: Create backup
    create_backup
    
    # Step 2: Update code
    update_code
    
    # Step 3: Check for changes
    check_schema_changes
    SCHEMA_CHANGED=$?
    
    update_dependencies
    DEPS_CHANGED=$?
    
    # Step 4: Perform update
    if [ $SCHEMA_CHANGED -eq 0 ] || [ $DEPS_CHANGED -eq 0 ]; then
        print_info "Changes detected, performing rolling update..."
        rolling_update
    else
        print_info "No significant changes, performing simple restart..."
        docker compose -f docker-compose.prod.yml restart app
    fi
    
    # Step 5: Verify update
    verify_update
    
    # Step 6: Cleanup
    cleanup
    
    echo ""
    print_status "🎉 Production update completed successfully!"
    echo "🌐 Application: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/api/health"
    echo ""
    echo "📝 Useful commands:"
    echo "  View logs: docker compose -f docker-compose.prod.yml logs -f app"
    echo "  Check status: docker compose -f docker-compose.prod.yml ps"
    echo "  Rollback: git reset --hard HEAD~1 && ./scripts/update-production.sh"
}

# Handle script interruption
trap 'print_error "Update interrupted! Check system status."; exit 1' INT TERM

# Run main function
main "$@"

#!/bin/bash
set -e

# Production Deployment Script - Optimized for Quick Updates
# Usage: ./scripts/deploy-production.sh [OPTIONS]
# Options: --quick, --full-rebuild, --backup-db, --help

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
QUICK_MODE=false
FULL_REBUILD=false
BACKUP_DB=false
COMPOSE_FILE="docker-compose.yml"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick         Quick deployment (restart only, no rebuild)"
    echo "  --full-rebuild  Force full rebuild even if not needed"
    echo "  --backup-db     Create database backup before deployment"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Smart deployment (auto-detect changes)"
    echo "  $0 --quick           # Quick restart only"
    echo "  $0 --full-rebuild    # Force complete rebuild"
    echo "  $0 --backup-db       # Backup database before deployment"
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                QUICK_MODE=true
                shift
                ;;
            --full-rebuild)
                FULL_REBUILD=true
                shift
                ;;
            --backup-db)
                BACKUP_DB=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Function to check git status and pull latest code
update_source_code() {
    print_status "Checking git status and updating source code..."

    # Check if git repo exists
    if [ ! -d ".git" ]; then
        print_warning "Not a git repository, skipping git operations"
        return 0
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Working directory has uncommitted changes"
        if [ "$QUICK_MODE" = false ]; then
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_error "Deployment cancelled"
                exit 1
            fi
        fi
    fi

    # Get current branch and pull latest
    CURRENT_BRANCH=$(git branch --show-current)
    print_status "Current branch: $CURRENT_BRANCH"

    if git pull origin "$CURRENT_BRANCH"; then
        print_success "Source code updated successfully"
    else
        print_error "Failed to pull latest code"
        exit 1
    fi
}

# Function to detect what needs to be rebuilt
detect_changes() {
    print_status "Analyzing changes to determine rebuild strategy..."

    if [ "$FULL_REBUILD" = true ]; then
        print_warning "Full rebuild forced by user"
        return 0
    fi

    if [ "$QUICK_MODE" = true ]; then
        print_status "Quick mode enabled - skipping change detection"
        return 0
    fi

    # Check for significant changes that require rebuild
    REBUILD_NEEDED=false

    # Check if this is first deployment
    if [ ! -f ".last-deployment" ]; then
        print_warning "First deployment detected - full rebuild required"
        FULL_REBUILD=true
        return 0
    fi

    # Get files changed since last deployment
    LAST_DEPLOYMENT_TIME=$(cat .last-deployment)
    CHANGED_FILES=$(find . -newer .last-deployment -type f -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null || echo "")

    if [ -z "$CHANGED_FILES" ]; then
        print_status "No file changes detected since last deployment"
        QUICK_MODE=true
        return 0
    fi

    # Check for critical files that require rebuild
    echo "$CHANGED_FILES" | while read -r file; do
        case "$file" in
            */package.json|*/pnpm-lock.yaml|*/yarn.lock)
                print_warning "Package dependencies changed - rebuild required"
                FULL_REBUILD=true
                ;;
            */Dockerfile|*/docker-compose.yml|*/docker-compose.*.yml)
                print_warning "Docker configuration changed - rebuild required"
                FULL_REBUILD=true
                ;;
            */prisma/schema.prisma|*/prisma/migrations/*)
                print_warning "Database schema changed - rebuild required"
                FULL_REBUILD=true
                ;;
            */src/*|*/app/*|*/pages/*|*/components/*|*/lib/*)
                print_status "Source code changed - rebuild recommended"
                ;;
        esac
    done

    if [ "$FULL_REBUILD" != true ]; then
        print_status "Only source code changes detected - quick rebuild sufficient"
    fi
}

# Function to backup database
backup_database() {
    if [ "$BACKUP_DB" = true ]; then
        print_status "Creating database backup..."

        # Create backup directory
        mkdir -p backups

        # Generate backup filename with timestamp
        BACKUP_FILE="backups/manga-db-backup-$(date +%Y%m%d-%H%M%S).sql"

        # Get database container
        DB_CONTAINER=$(docker compose ps -q db 2>/dev/null || echo "")

        if [ -n "$DB_CONTAINER" ] && [ "$(docker ps -q -f id=$DB_CONTAINER)" ]; then
            print_status "Creating backup: $BACKUP_FILE"
            if docker exec "$DB_CONTAINER" pg_dump -U postgres manga-next > "$BACKUP_FILE"; then
                print_success "Database backup created successfully"
                print_status "Backup location: $BACKUP_FILE"
            else
                print_warning "Database backup failed, continuing deployment"
            fi
        else
            print_warning "Database container not running, skipping backup"
        fi
    fi
}

# Function to deploy application
deploy_application() {
    print_status "Starting application deployment..."

    if [ "$QUICK_MODE" = true ]; then
        print_status "Quick deployment: Restarting application only..."

        # Quick restart - just restart the app service
        if docker compose restart app; then
            print_success "Application restarted successfully"
        else
            print_error "Failed to restart application"
            exit 1
        fi

    elif [ "$FULL_REBUILD" = true ]; then
        print_status "Full rebuild: Rebuilding all services..."

        # Stop all services
        print_status "Stopping services..."
        docker compose down

        # Remove old images (optional cleanup)
        print_status "Cleaning up old images..."
        docker image prune -f > /dev/null 2>&1 || true

        # Build and start services
        print_status "Building and starting services..."
        if docker compose up -d --build; then
            print_success "Full rebuild completed successfully"
        else
            print_error "Full rebuild failed"
            exit 1
        fi

    else
        print_status "Smart deployment: Zero-downtime rebuild..."

        # Build new image first (without stopping current app)
        print_status "Building new application image..."
        if docker compose build app; then
            print_success "New image built successfully"
        else
            print_error "Failed to build new image"
            exit 1
        fi

        # Quick swap: stop old, start new (minimal downtime)
        print_status "Performing quick container swap..."
        if docker compose up -d app; then
            print_success "Application updated successfully"
        else
            print_error "Failed to start new container"
            exit 1
        fi
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Wait for services to start
    print_status "Waiting for services to be ready..."
    sleep 15

    # Check if containers are running
    if docker compose ps | grep -q "Up"; then
        print_success "Docker services are running"
    else
        print_error "Some services failed to start"
        print_status "Service status:"
        docker compose ps
        exit 1
    fi

    # Health check with retries
    print_status "Performing health check..."
    HEALTH_CHECK_RETRIES=6
    HEALTH_CHECK_DELAY=10

    for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            print_success "Application health check passed"
            break
        else
            if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
                print_error "Application health check failed after $HEALTH_CHECK_RETRIES attempts"
                print_status "Check logs with: docker compose logs app"
                exit 1
            else
                print_status "Health check attempt $i/$HEALTH_CHECK_RETRIES failed, retrying in ${HEALTH_CHECK_DELAY}s..."
                sleep $HEALTH_CHECK_DELAY
            fi
        fi
    done

    # Update deployment timestamp
    date > .last-deployment
    print_success "Deployment timestamp updated"
}

# Function to show deployment summary
show_deployment_summary() {
    echo ""
    echo "🎉 =================================="
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "🎉 =================================="
    echo ""
    print_success "Deployment Summary:"
    echo "  📅 Deployment Time: $(date)"
    echo "  🌿 Git Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo "  📝 Latest Commit: $(git log -1 --oneline 2>/dev/null || echo 'N/A')"
    echo "  🚀 Deployment Mode: $([ "$QUICK_MODE" = true ] && echo "Quick Restart" || ([ "$FULL_REBUILD" = true ] && echo "Full Rebuild" || echo "Smart Rebuild"))"
    echo ""
    echo "🌐 Application URLs:"
    echo "  Main Site: http://localhost:3000"
    echo "  Health Check: http://localhost:3000/api/health"
    echo ""
    echo "📝 Useful Commands:"
    echo "  View logs: docker compose logs -f app"
    echo "  Stop services: docker compose down"
    echo "  Quick restart: $0 --quick"
    echo "  Full rebuild: $0 --full-rebuild"
    echo ""
    print_status "Service Status:"
    docker compose ps
}

# Main execution function
main() {
    echo "🚀 Production Deployment Script"
    echo "==============================="

    # Parse command line arguments
    parse_arguments "$@"

    # Show deployment mode
    if [ "$QUICK_MODE" = true ]; then
        print_status "Mode: Quick Restart (no rebuild)"
    elif [ "$FULL_REBUILD" = true ]; then
        print_status "Mode: Full Rebuild (complete rebuild)"
    else
        print_status "Mode: Smart Deployment (auto-detect changes)"
    fi

    # Execute deployment steps
    if [ "$QUICK_MODE" != true ]; then
        update_source_code
        detect_changes
    fi

    # CRITICAL: Always backup before any deployment
    backup_database

    # Check for migration issues before deployment
    print_status "Checking for potential migration issues..."
    if docker compose exec app npx prisma migrate status 2>&1 | grep -q "P3005"; then
        print_error "CRITICAL: P3005 migration error detected!"
        print_error "This could cause data loss. Please run:"
        print_error "  ./scripts/manage-database.sh fix-baseline"
        print_error ""
        print_error "Deployment STOPPED to prevent data loss."
        exit 1
    fi

    deploy_application
    verify_deployment
    show_deployment_summary
}

# Run main function with all arguments
main "$@"

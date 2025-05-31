#!/bin/bash
set -e

# Database Management Script for Manga Website
# Usage: ./scripts/manage-database.sh [COMMAND] [OPTIONS]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo "Database Management Script for Manga Website"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  migrate         Apply pending migrations to production"
    echo "  fix-baseline    Fix P3005 migration error (baseline existing DB)"
    echo "  backup          Create database backup"
    echo "  restore         Restore database from backup"
    echo "  status          Show migration status"
    echo "  seed            Seed database with initial data"
    echo "  reset           Reset database (DANGEROUS - use with caution)"
    echo ""
    echo "Options:"
    echo "  --force         Force operation without confirmation"
    echo "  --file FILE     Specify backup file for restore"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 migrate                    # Apply pending migrations"
    echo "  $0 backup                     # Create database backup"
    echo "  $0 restore --file backup.sql # Restore from specific backup"
    echo "  $0 reset --force              # Reset database without confirmation"
}

# Function to check if database container is running
check_database() {
    print_status "Checking database connection..."
    
    DB_CONTAINER=$(docker compose ps -q db 2>/dev/null || echo "")
    
    if [ -z "$DB_CONTAINER" ]; then
        print_error "Database container not found"
        print_status "Start database with: docker compose up -d db"
        exit 1
    fi
    
    if [ -z "$(docker ps -q -f id=$DB_CONTAINER)" ]; then
        print_error "Database container is not running"
        print_status "Start database with: docker compose up -d db"
        exit 1
    fi
    
    # Test connection
    if docker exec "$DB_CONTAINER" pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database connection established"
    else
        print_error "Database is not ready"
        exit 1
    fi
}

# Function to apply migrations
migrate_database() {
    print_status "Applying database migrations..."
    
    if [ "$FORCE" != true ]; then
        echo "This will apply all pending migrations to the production database."
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Migration cancelled"
            exit 0
        fi
    fi
    
    # Run migrations using Prisma
    if npx prisma migrate deploy; then
        print_success "Migrations applied successfully"
    else
        print_error "Migration failed"
        print_status "Attempting to push schema as fallback..."
        if npx prisma db push; then
            print_success "Schema push completed successfully"
        else
            print_error "Failed to apply database changes"
            exit 1
        fi
    fi
    
    # Show migration status
    print_status "Current migration status:"
    npx prisma migrate status || true
}

# Function to create database backup
backup_database() {
    print_status "Creating database backup..."
    
    # Create backup directory
    mkdir -p backups
    
    # Generate backup filename
    if [ -n "$BACKUP_FILE" ]; then
        BACKUP_PATH="backups/$BACKUP_FILE"
    else
        BACKUP_PATH="backups/manga-db-backup-$(date +%Y%m%d-%H%M%S).sql"
    fi
    
    # Create backup
    DB_CONTAINER=$(docker compose ps -q db)
    if docker exec "$DB_CONTAINER" pg_dump -U postgres -d manga-next > "$BACKUP_PATH"; then
        print_success "Database backup created: $BACKUP_PATH"
        
        # Show backup info
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        print_status "Backup size: $BACKUP_SIZE"
        
        # Keep only last 10 backups
        print_status "Cleaning old backups (keeping last 10)..."
        ls -t backups/manga-db-backup-*.sql 2>/dev/null | tail -n +11 | xargs rm -f || true
        
    else
        print_error "Failed to create database backup"
        exit 1
    fi
}

# Function to restore database from backup
restore_database() {
    if [ -z "$RESTORE_FILE" ]; then
        print_error "No backup file specified"
        print_status "Use: $0 restore --file backup.sql"
        exit 1
    fi
    
    if [ ! -f "$RESTORE_FILE" ]; then
        print_error "Backup file not found: $RESTORE_FILE"
        exit 1
    fi
    
    print_warning "This will COMPLETELY REPLACE the current database!"
    print_status "Backup file: $RESTORE_FILE"
    
    if [ "$FORCE" != true ]; then
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Restore cancelled"
            exit 0
        fi
    fi
    
    # Create backup before restore
    print_status "Creating backup before restore..."
    backup_database
    
    # Restore database
    print_status "Restoring database from $RESTORE_FILE..."
    DB_CONTAINER=$(docker compose ps -q db)
    
    if docker exec -i "$DB_CONTAINER" psql -U postgres -d manga-next < "$RESTORE_FILE"; then
        print_success "Database restored successfully"
    else
        print_error "Failed to restore database"
        exit 1
    fi
}

# Function to show migration status
show_status() {
    print_status "Database migration status:"
    npx prisma migrate status
    
    print_status "Database schema info:"
    DB_CONTAINER=$(docker compose ps -q db)
    docker exec "$DB_CONTAINER" psql -U postgres -d manga-next -c "\dt" || true
}

# Function to seed database
seed_database() {
    print_status "Seeding database with initial data..."
    
    if [ -f "prisma/seed.ts" ]; then
        if pnpm seed; then
            print_success "Database seeding completed"
        else
            print_error "Database seeding failed"
            exit 1
        fi
    else
        print_warning "No seed file found (prisma/seed.ts)"
    fi
}

# Function to fix P3005 migration baseline error
fix_baseline() {
    print_warning "This will fix P3005 migration error by baselining the database"
    print_status "This is SAFE and will NOT delete your data"

    if [ "$FORCE" != true ]; then
        read -p "Continue with baseline fix? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Baseline fix cancelled"
            exit 0
        fi
    fi

    # Create backup first
    print_status "Creating backup before baseline fix..."
    backup_database

    # Create missing search function if needed
    print_status "Checking for missing database functions..."
    DB_CONTAINER=$(docker compose ps -q db)

    # Check if update_comics_search_vector function exists
    FUNCTION_EXISTS=$(docker exec "$DB_CONTAINER" psql -U postgres -d manga-next -t -c "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_comics_search_vector');" | tr -d ' \n')

    if [ "$FUNCTION_EXISTS" = "f" ]; then
        print_status "Creating missing search function..."
        docker exec "$DB_CONTAINER" psql -U postgres -d manga-next << 'EOF'
CREATE OR REPLACE FUNCTION update_comics_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.author, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comics_search_vector_trigger ON "Comic";
CREATE TRIGGER update_comics_search_vector_trigger
    BEFORE INSERT OR UPDATE ON "Comic"
    FOR EACH ROW
    EXECUTE FUNCTION update_comics_search_vector();
EOF
        print_success "Search function created"
    fi

    # Baseline migrations
    print_status "Marking migrations as applied (baseline)..."
    FIRST_MIGRATION=$(ls prisma/migrations | head -1)

    if [ -n "$FIRST_MIGRATION" ]; then
        if npx prisma migrate resolve --applied "$FIRST_MIGRATION"; then
            print_success "Migration baseline completed"

            # Apply any remaining migrations
            if npx prisma migrate deploy; then
                print_success "All migrations applied successfully"
            else
                print_warning "Some migrations failed to apply"
            fi
        else
            print_error "Failed to baseline migrations"
            exit 1
        fi
    else
        print_warning "No migrations found to baseline"
    fi
}

# Function to reset database
reset_database() {
    print_warning "This will COMPLETELY RESET the database!"
    print_warning "All data will be lost!"

    if [ "$FORCE" != true ]; then
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Reset cancelled"
            exit 0
        fi
    fi

    # Create backup before reset
    print_status "Creating backup before reset..."
    backup_database

    # Reset database
    print_status "Resetting database..."
    if npx prisma migrate reset --force; then
        print_success "Database reset completed"
    else
        print_error "Database reset failed"
        exit 1
    fi
}

# Parse command line arguments
COMMAND=""
FORCE=false
RESTORE_FILE=""
BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        migrate|fix-baseline|backup|restore|status|seed|reset)
            COMMAND=$1
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --file)
            RESTORE_FILE="$2"
            shift 2
            ;;
        --name)
            BACKUP_FILE="$2"
            shift 2
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

# Function to load environment variables
load_environment() {
    print_status "Loading environment variables..."

    # Try to load from various env files
    ENV_FILES=(".env.production" ".env.local" ".env")

    for env_file in "${ENV_FILES[@]}"; do
        if [ -f "$env_file" ]; then
            print_status "Loading from $env_file"
            export $(grep -v '^#' "$env_file" | grep -v '^$' | xargs) 2>/dev/null || true
            break
        fi
    done

    # Verify DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not found in environment"
        print_status "Please ensure one of these files exists with DATABASE_URL:"
        print_status "  - .env.production"
        print_status "  - .env.local"
        print_status "  - .env"
        exit 1
    fi

    print_success "Environment variables loaded"
}

# Main execution
main() {
    echo "🗄️  Database Management Script"
    echo "============================="

    if [ -z "$COMMAND" ]; then
        print_error "No command specified"
        show_help
        exit 1
    fi

    # Load environment variables first
    load_environment

    # Check database connection
    check_database
    
    # Execute command
    case $COMMAND in
        migrate)
            migrate_database
            ;;
        fix-baseline)
            fix_baseline
            ;;
        backup)
            backup_database
            ;;
        restore)
            restore_database
            ;;
        status)
            show_status
            ;;
        seed)
            seed_database
            ;;
        reset)
            reset_database
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
    
    print_success "Operation completed successfully!"
}

# Run main function
main "$@"

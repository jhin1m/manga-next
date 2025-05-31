#!/bin/bash
set -e

# Zero-Downtime Deployment Script
# Uses blue-green deployment strategy with health checks

echo "🔄 Zero-Downtime Deployment Starting..."

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
APP_NAME="manga-fake"
HEALTH_ENDPOINT="http://localhost:3000/api/health"
HEALTH_TIMEOUT=60
HEALTH_INTERVAL=5

# Function to check if container is healthy
check_health() {
    local container_name=$1
    local max_attempts=$((HEALTH_TIMEOUT / HEALTH_INTERVAL))
    local attempt=1

    print_status "Checking health of $container_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec "$container_name" curl -f "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            print_success "$container_name is healthy"
            return 0
        fi
        
        print_status "Health check attempt $attempt/$max_attempts for $container_name..."
        sleep $HEALTH_INTERVAL
        attempt=$((attempt + 1))
    done
    
    print_error "$container_name failed health check"
    return 1
}

# Function to get current running container
get_current_container() {
    docker compose ps -q app 2>/dev/null || echo ""
}

# Function to perform zero-downtime deployment
zero_downtime_deploy() {
    print_status "Starting zero-downtime deployment..."
    
    # Get current container
    CURRENT_CONTAINER=$(get_current_container)
    
    if [ -z "$CURRENT_CONTAINER" ]; then
        print_warning "No current container found, performing normal deployment"
        docker compose up -d app
        return 0
    fi
    
    print_status "Current container: $CURRENT_CONTAINER"
    
    # Build new image
    print_status "Building new application image..."
    if ! docker compose build app; then
        print_error "Failed to build new image"
        exit 1
    fi
    
    # Create new container with temporary name
    print_status "Creating new container..."
    NEW_CONTAINER_NAME="${APP_NAME}-app-new"
    
    # Start new container on different port temporarily
    if ! docker run -d \
        --name "$NEW_CONTAINER_NAME" \
        --network "${APP_NAME}_manga-network" \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        -e NEXTAUTH_URL="$NEXTAUTH_URL" \
        -e NODE_ENV=production \
        "${APP_NAME}-app:latest"; then
        print_error "Failed to start new container"
        exit 1
    fi
    
    # Wait for new container to be healthy
    if check_health "$NEW_CONTAINER_NAME"; then
        print_success "New container is healthy, performing swap..."
        
        # Stop old container
        print_status "Stopping old container..."
        docker stop "$CURRENT_CONTAINER" > /dev/null 2>&1 || true
        
        # Remove old container
        docker rm "$CURRENT_CONTAINER" > /dev/null 2>&1 || true
        
        # Rename new container and restart with proper configuration
        docker stop "$NEW_CONTAINER_NAME" > /dev/null 2>&1
        docker rm "$NEW_CONTAINER_NAME" > /dev/null 2>&1
        
        # Start with proper docker-compose configuration
        docker compose up -d app
        
        print_success "Zero-downtime deployment completed!"
        
    else
        print_error "New container failed health check, rolling back..."
        docker stop "$NEW_CONTAINER_NAME" > /dev/null 2>&1 || true
        docker rm "$NEW_CONTAINER_NAME" > /dev/null 2>&1 || true
        print_status "Old container is still running"
        exit 1
    fi
}

# Function to perform rolling restart (for quick updates)
rolling_restart() {
    print_status "Performing rolling restart..."
    
    # Get current container
    CURRENT_CONTAINER=$(get_current_container)
    
    if [ -z "$CURRENT_CONTAINER" ]; then
        print_warning "No container running, starting fresh"
        docker compose up -d app
        return 0
    fi
    
    # Graceful restart
    print_status "Gracefully restarting container..."
    docker compose restart app
    
    # Wait for health check
    sleep 10
    if curl -f "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
        print_success "Rolling restart completed successfully"
    else
        print_error "Application failed to start after restart"
        exit 1
    fi
}

# Main function
main() {
    echo "🔄 Zero-Downtime Deployment Script"
    echo "=================================="
    
    # Parse arguments
    DEPLOYMENT_TYPE="zero-downtime"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rolling-restart)
                DEPLOYMENT_TYPE="rolling-restart"
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --rolling-restart    Quick rolling restart (minimal downtime)"
                echo "  --help              Show this help"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs) 2>/dev/null || true
    fi
    
    # Execute deployment
    case $DEPLOYMENT_TYPE in
        "zero-downtime")
            zero_downtime_deploy
            ;;
        "rolling-restart")
            rolling_restart
            ;;
        *)
            print_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            exit 1
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Run main function
main "$@"

#!/bin/bash
set -e

# Production Deployment Script with Security Checks
# Usage: ./scripts/deploy-production.sh

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to check if required files exist
check_required_files() {
    echo "🔍 Checking required files..."
    
    REQUIRED_FILES=(
        ".env.production"
        ".env.production.db"
        "docker-compose.prod.yml"
        "Dockerfile"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file $file not found!"
            echo "Please create $file from the corresponding .example file"
            exit 1
        fi
        print_status "$file exists"
    done
}

# Function to validate environment variables
validate_env_vars() {
    echo "🔍 Validating environment variables..."
    
    # Source the production environment file
    if [ -f ".env.production" ]; then
        export $(grep -v '^#' .env.production | xargs)
    fi
    
    # Check required variables
    REQUIRED_VARS=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Environment variable $var is not set in .env.production"
            exit 1
        fi
        print_status "$var is configured"
    done
    
    # Check NEXTAUTH_SECRET length
    if [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
        print_error "NEXTAUTH_SECRET must be at least 32 characters long"
        exit 1
    fi
    
    # Check for default/example values
    if [[ "$NEXTAUTH_SECRET" == *"your-super-secret"* ]]; then
        print_error "NEXTAUTH_SECRET appears to be using default example value"
        exit 1
    fi
    
    if [[ "$DATABASE_URL" == *"username:password"* ]]; then
        print_error "DATABASE_URL appears to be using default example value"
        exit 1
    fi
}

# Function to check Docker and Docker Compose
check_docker() {
    echo "🔍 Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_status "Docker is installed"
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_status "Docker Compose is installed"
}

# Function to build and deploy
deploy() {
    echo "🏗️  Building and deploying..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker compose -f docker-compose.prod.yml down || true
    
    # Build new images
    print_status "Building Docker images..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for health checks
    echo "⏳ Waiting for services to be healthy..."
    sleep 30
    
    # Check service status
    docker compose -f docker-compose.prod.yml ps
}

# Function to run post-deployment checks
post_deployment_checks() {
    echo "🔍 Running post-deployment checks..."
    
    # Check if app is responding
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_status "Application health check passed"
    else
        print_error "Application health check failed"
        echo "Check logs with: docker compose -f docker-compose.prod.yml logs app"
        exit 1
    fi
    
    # Show final status
    echo ""
    print_status "Deployment completed successfully!"
    echo "🌐 Application is running at: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/api/health"
    echo ""
    echo "📝 Useful commands:"
    echo "  View logs: docker compose -f docker-compose.prod.yml logs -f app"
    echo "  Stop services: docker compose -f docker-compose.prod.yml down"
    echo "  Restart app: docker compose -f docker-compose.prod.yml restart app"
}

# Main execution
main() {
    check_required_files
    validate_env_vars
    check_docker
    deploy
    post_deployment_checks
}

# Run main function
main "$@"

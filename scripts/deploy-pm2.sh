#!/bin/bash

# PM2 Deployment Script for NextJS 15 Manga Website
# Usage: ./scripts/deploy-pm2.sh [environment] [action]
# Example: ./scripts/deploy-pm2.sh production deploy
# Example: ./scripts/deploy-pm2.sh production restart

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
APP_NAME="manga-website"
LOG_FILE="./logs/deployment.log"

# Create logs directory if it doesn't exist
mkdir -p logs

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed. Please install it globally: npm install -g pm2"
    fi
    log "PM2 is installed: $(pm2 --version)"
}

# Check if required files exist
check_requirements() {
    log "Checking requirements..."
    
    if [ ! -f "ecosystem.config.js" ]; then
        error "ecosystem.config.js not found"
    fi
    
    if [ ! -f "package.json" ]; then
        error "package.json not found"
    fi
    
    if [ ! -f ".env.production" ] && [ "$ENVIRONMENT" = "production" ]; then
        warning ".env.production not found. Make sure to configure it before deployment."
    fi
    
    log "Requirements check passed"
}

# Pre-deployment checks
pre_deploy_checks() {
    log "Running pre-deployment checks..."
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log "Node.js version: $NODE_VERSION"
    
    # Check pnpm version
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        log "pnpm version: $PNPM_VERSION"
    else
        error "pnpm is not installed. Please install it: curl -fsSL https://get.pnpm.io/install.sh | sh -"
    fi
    
    # Check database connection (optional)
    if [ -f ".env.production" ]; then
        log "Environment file found"
    fi
}

# Build application
build_app() {
    log "Building application..."
    
    # Install dependencies
    log "Installing dependencies..."
    pnpm install --frozen-lockfile || error "Failed to install dependencies"
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npx prisma generate || error "Failed to generate Prisma client"
    
    # Run database migrations (production only)
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Running database migrations..."
        npx prisma migrate deploy || error "Failed to run database migrations"
    fi
    
    # Build Next.js application
    log "Building Next.js application..."
    pnpm build || error "Failed to build application"
    
    log "Build completed successfully"
}

# Deploy with PM2
deploy_pm2() {
    log "Deploying with PM2..."
    
    # Check if app is already running
    if pm2 list | grep -q "$APP_NAME"; then
        log "Application is already running. Performing reload..."
        pm2 reload ecosystem.config.js --env "$ENVIRONMENT" || error "Failed to reload application"
    else
        log "Starting new application instance..."
        pm2 start ecosystem.config.js --env "$ENVIRONMENT" || error "Failed to start application"
    fi
    
    # Save PM2 configuration
    pm2 save || warning "Failed to save PM2 configuration"
    
    log "Deployment completed successfully"
}

# Restart application
restart_app() {
    log "Restarting application..."
    pm2 restart ecosystem.config.js --env "$ENVIRONMENT" || error "Failed to restart application"
    log "Application restarted successfully"
}

# Stop application
stop_app() {
    log "Stopping application..."
    pm2 stop ecosystem.config.js || error "Failed to stop application"
    log "Application stopped successfully"
}

# Show application status
show_status() {
    log "Application status:"
    pm2 status
    pm2 info "$APP_NAME" 2>/dev/null || true
}

# Show logs
show_logs() {
    log "Showing application logs..."
    pm2 logs "$APP_NAME" --lines 50
}

# Main execution
main() {
    log "Starting PM2 deployment script..."
    log "Environment: $ENVIRONMENT"
    log "Action: $ACTION"
    
    check_pm2
    check_requirements
    
    case $ACTION in
        "deploy")
            pre_deploy_checks
            build_app
            deploy_pm2
            show_status
            ;;
        "restart")
            restart_app
            show_status
            ;;
        "stop")
            stop_app
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "build")
            pre_deploy_checks
            build_app
            ;;
        *)
            error "Unknown action: $ACTION. Available actions: deploy, restart, stop, status, logs, build"
            ;;
    esac
    
    log "Script completed successfully"
}

# Run main function
main "$@"

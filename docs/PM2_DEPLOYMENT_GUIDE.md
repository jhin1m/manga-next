# 🚀 PM2 Deployment Guide - NextJS 15 Manga Website

## 📋 Overview

This guide provides comprehensive instructions for deploying and managing the NextJS 15 manga website using PM2 (Process Manager 2) on a VPS without Docker containers.

## 🛠️ Prerequisites

### System Requirements

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (for deployment compatibility)
- **PM2**: Latest version (installed globally)
- **PostgreSQL**: Running and accessible
- **VPS**: Ubuntu/Debian recommended

### Installation Commands

```bash
# Install Node.js 20 (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Install PM2 globally
npm install -g pm2

# Verify installations
node --version    # Should be >= 18.0.0
pnpm --version    # Should be >= 8.0.0
pm2 --version     # Should show PM2 version
```

## 🔧 Configuration Files

### 1. Ecosystem Configuration (`ecosystem.config.js`)

- ✅ **Cluster Mode**: Utilizes all CPU cores for optimal performance
- ✅ **Auto-restart**: Handles crashes and memory limits
- ✅ **Environment Support**: Development and production configurations
- ✅ **Logging**: Structured logging with rotation
- ✅ **Health Monitoring**: Process health checks and exponential backoff

### 2. Environment Configuration (`.env.production`)

```bash
# Copy from example and configure
cp .env.production.example .env.production
# Edit with your production values
nano .env.production
```

Required variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secure authentication secret
- `NEXTAUTH_URL`: Your domain URL
- `NEXT_PUBLIC_API_URL`: API base URL

## 🚀 Deployment Process

### Quick Deployment

```bash
# 1. Clone and setup
git clone your-repo-url
cd manga-website
pnpm install --frozen-lockfile

# 2. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 3. Database setup
npx prisma generate
npx prisma migrate deploy

# 4. Build and deploy
pnpm build
pnpm pm2:start

# 5. Save PM2 configuration
pnpm pm2:save
pnpm pm2:startup
```

### Using Deployment Script

```bash
# Full automated deployment
pnpm deploy:script

# Or use the shell script directly
./scripts/deploy-pm2.sh production deploy
```

## 📊 Management Commands

### Basic PM2 Operations

```bash
# Start application
pnpm pm2:start

# Restart application (with downtime)
pnpm pm2:restart

# Reload application (zero-downtime)
pnpm pm2:reload

# Stop application
pnpm pm2:stop

# Delete application from PM2
pnpm pm2:delete

# View status
pnpm pm2:status

# View logs
pnpm pm2:logs

# Monitor in real-time
pnpm pm2:monit
```

### Deployment Commands

```bash
# Quick production deployment
pnpm deploy:prod

# Fresh deployment (full rebuild)
pnpm deploy:fresh

# Using deployment script
pnpm deploy:script      # Full deployment
pnpm deploy:restart     # Restart only
pnpm deploy:status      # Check status
pnpm deploy:logs        # View logs
pnpm deploy:stop        # Stop application
```

### Health Monitoring

```bash
# Single health check
pnpm health:check

# Continuous monitoring
pnpm health:monitor

# Process status only
pnpm health:status

# Test PM2 configuration
pnpm test:pm2
```

## 🔍 Monitoring and Troubleshooting

### Log Files Location

```
logs/
├── pm2/
│   ├── combined.log    # All logs combined
│   ├── out.log         # Standard output
│   └── error.log       # Error logs
├── deployment.log      # Deployment script logs
├── health-check.log    # Health monitoring logs
└── health-check-results.json  # Latest health status
```

### Health Check Endpoint

- **URL**: `http://your-domain.com/api/health`
- **Method**: GET or HEAD
- **Response**: JSON with detailed health status
- **Status Codes**:
  - `200`: Healthy or degraded
  - `503`: Unhealthy

### Common Issues and Solutions

#### 1. Application Won't Start

```bash
# Check PM2 status
pnpm pm2:status

# View error logs
pnpm pm2:logs

# Check configuration
pnpm test:pm2

# Restart with fresh build
pnpm deploy:fresh
```

#### 2. High Memory Usage

```bash
# Check memory usage
pnpm health:status

# Restart application
pnpm pm2:restart

# Monitor continuously
pnpm health:monitor
```

#### 3. Database Connection Issues

```bash
# Test database connectivity
curl http://localhost:3000/api/health

# Check environment variables
cat .env.production

# Run Prisma migrations
npx prisma migrate deploy
```

#### 4. Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>

# Or change port in .env.production
echo "PORT=3001" >> .env.production
```

## 🔄 Production Workflow

### 1. Initial Deployment

```bash
# On your VPS
git clone your-repo-url /var/www/manga-website
cd /var/www/manga-website
pnpm install --frozen-lockfile
cp .env.production.example .env.production
# Configure .env.production
npx prisma generate
npx prisma migrate deploy
pnpm build
pnpm pm2:start
pnpm pm2:save
sudo pm2 startup
```

### 2. Updates and Maintenance

```bash
# Pull latest changes
git pull origin main

# Update dependencies if needed
pnpm install --frozen-lockfile

# Run migrations
npx prisma migrate deploy

# Rebuild and reload (zero-downtime)
pnpm build
pnpm pm2:reload

# Save configuration
pnpm pm2:save
```

### 3. Monitoring Setup

```bash
# Setup continuous health monitoring
nohup pnpm health:monitor > /dev/null 2>&1 &

# Or use PM2 to manage health monitoring
pm2 start scripts/pm2-health-check.js --name health-monitor -- monitor
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env.production` to version control
2. **File Permissions**: Ensure proper file permissions on VPS
3. **Firewall**: Configure firewall to allow only necessary ports
4. **SSL/TLS**: Use reverse proxy (Nginx) with SSL certificates
5. **Database**: Use strong passwords and restrict database access

## 📈 Performance Optimization

### Cluster Mode Benefits

- **CPU Utilization**: Uses all available CPU cores
- **Load Distribution**: Distributes requests across processes
- **Fault Tolerance**: If one process crashes, others continue
- **Zero-downtime Deployments**: Reload processes one by one

### Memory Management

- **Memory Limit**: 1GB per process (configurable)
- **Auto-restart**: Restarts process if memory limit exceeded
- **Monitoring**: Continuous memory usage monitoring

### Logging Optimization

- **Log Rotation**: Prevents log files from growing too large
- **Structured Logging**: JSON format for better parsing
- **Error Tracking**: Separate error logs for debugging

## 🆘 Emergency Procedures

### Application Down

```bash
# Quick restart
pnpm pm2:restart

# If restart fails, delete and start fresh
pnpm pm2:delete
pnpm pm2:start
```

### High Resource Usage

```bash
# Check resource usage
pnpm health:status

# Scale down if needed (temporary)
pm2 scale manga-website 1

# Scale back up when resolved
pm2 scale manga-website max
```

### Database Issues

```bash
# Check database connectivity
pnpm health:check

# Reset database connection
pnpm pm2:restart

# If migrations needed
npx prisma migrate deploy
```

---

## 📞 Support

For issues and questions:

1. Check logs: `pnpm pm2:logs`
2. Run health check: `pnpm health:check`
3. Review this documentation
4. Check PM2 official documentation: https://pm2.keymetrics.io/

**Status**: Production Ready ✅  
**Last Updated**: $(date)  
**Version**: 1.0.0

# 🚀 PM2 Quick Reference - Manga Website

## 📋 Essential Commands

### 🔧 Setup & Installation
```bash
# Install PM2 globally
npm install -g pm2

# Test configuration
pnpm test:pm2

# First time setup
pnpm install --frozen-lockfile
cp .env.production.example .env.production
# Edit .env.production with your values
npx prisma generate && npx prisma migrate deploy
pnpm build
```

### 🚀 Deployment Commands
```bash
# Quick deployment
pnpm deploy:script

# Manual deployment steps
pnpm pm2:start          # Start application
pnpm pm2:restart        # Restart (with downtime)
pnpm pm2:reload         # Reload (zero-downtime)
pnpm pm2:stop           # Stop application
pnpm pm2:delete         # Remove from PM2

# Save PM2 configuration
pnpm pm2:save
pnpm pm2:startup
```

### 📊 Monitoring Commands
```bash
# Status and monitoring
pnpm pm2:status         # Show process status
pnpm pm2:logs           # View logs
pnpm pm2:monit          # Real-time monitoring

# Health checks
pnpm health:check       # Single health check
pnpm health:monitor     # Continuous monitoring
pnpm health:status      # Process status only
```

### 🔄 Update Workflow
```bash
# Standard update process
git pull origin main
pnpm install --frozen-lockfile
npx prisma migrate deploy
pnpm build
pnpm pm2:reload
pnpm pm2:save
```

## 🗂️ File Structure
```
├── ecosystem.config.js          # PM2 configuration
├── scripts/
│   ├── deploy-pm2.sh           # Deployment script
│   ├── pm2-health-check.js     # Health monitoring
│   └── test-pm2-config.js      # Configuration test
├── logs/
│   ├── pm2/                    # PM2 logs
│   ├── deployment.log          # Deployment logs
│   └── health-check.log        # Health check logs
└── src/app/api/health/         # Health endpoint
```

## 🔍 Troubleshooting

### Common Issues
```bash
# App won't start
pnpm test:pm2                   # Check configuration
pnpm pm2:logs                   # Check error logs
pnpm deploy:fresh               # Fresh deployment

# High memory usage
pnpm health:status              # Check memory usage
pnpm pm2:restart                # Restart application

# Database issues
curl localhost:3000/api/health  # Test health endpoint
npx prisma migrate deploy       # Run migrations
```

### Log Locations
- **PM2 Logs**: `./logs/pm2/`
- **Deployment**: `./logs/deployment.log`
- **Health Check**: `./logs/health-check.log`
- **Health Results**: `./logs/health-check-results.json`

## 🌐 Environment Configuration

### Required Variables (.env.production)
```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@localhost:5432/manga_production"
NEXTAUTH_SECRET="your-super-secure-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="https://your-domain.com"
PORT=3000
```

### Health Check Endpoint
- **URL**: `/api/health`
- **Methods**: GET, HEAD
- **Response**: JSON health status
- **Status Codes**: 200 (healthy), 503 (unhealthy)

## 🔧 PM2 Configuration Highlights

### Cluster Mode
- **Instances**: Uses all CPU cores (`max`)
- **Mode**: Cluster for load balancing
- **Zero-downtime**: Reload without stopping

### Auto-restart
- **Memory Limit**: 1GB per process
- **Max Restarts**: 15 attempts
- **Exponential Backoff**: Prevents restart loops

### Logging
- **Format**: JSON structured logs
- **Rotation**: Automatic log rotation
- **Files**: Combined, output, and error logs

## 🚨 Emergency Commands

### Quick Recovery
```bash
# Application completely down
pnpm pm2:delete && pnpm pm2:start

# High resource usage
pm2 scale manga-website 1      # Scale down
pm2 scale manga-website max    # Scale back up

# Database connection lost
pnpm pm2:restart
```

### System Status Check
```bash
# Full system health
pnpm health:check

# Process information
pnpm pm2:status
pm2 info manga-website

# Resource usage
pm2 monit
```

## 📈 Performance Tips

1. **Use Reload**: `pnpm pm2:reload` for zero-downtime updates
2. **Monitor Memory**: Regular `pnpm health:status` checks
3. **Log Management**: Monitor log file sizes in `./logs/`
4. **Database**: Keep database connections optimized
5. **Environment**: Use production environment variables

## 🔗 Useful Links

- **PM2 Documentation**: https://pm2.keymetrics.io/
- **Health Endpoint**: `http://your-domain.com/api/health`
- **Logs Directory**: `./logs/`
- **Configuration**: `./ecosystem.config.js`

---

**Quick Start**: `pnpm test:pm2 && pnpm deploy:script`  
**Emergency**: `pnpm pm2:restart`  
**Monitor**: `pnpm health:monitor`

# 🚀 PM2 Configuration for NextJS 15 Manga Website

## 📋 Overview

Complete PM2 (Process Manager 2) implementation for production deployment of the NextJS 15 manga website on VPS without Docker containers.

## ✅ Features Implemented

### 🔧 Core Configuration

- **✅ Cluster Mode**: Utilizes all CPU cores for optimal performance
- **✅ Auto-restart**: Handles crashes and memory limits (1GB)
- **✅ Environment Support**: Development and production configurations
- **✅ Zero-downtime Deployments**: Reload without stopping service
- **✅ Exponential Backoff**: Prevents restart loops

### 📊 Monitoring & Health Checks

- **✅ Health Endpoint**: `/api/health` with comprehensive status
- **✅ Process Monitoring**: Memory, CPU, and uptime tracking
- **✅ Database Connectivity**: Real-time database health checks
- **✅ Log Management**: Structured logging with rotation
- **✅ Automated Health Monitoring**: Continuous background monitoring

### 🚀 Deployment Automation

- **✅ Deployment Script**: Automated deployment with error handling
- **✅ Pre/Post Hooks**: Database migrations and build automation
- **✅ Environment Validation**: Checks required environment variables
- **✅ Rollback Support**: Easy rollback on deployment failures

### 📝 Comprehensive Documentation

- **✅ Deployment Guide**: Step-by-step production deployment
- **✅ Quick Reference**: Essential commands and troubleshooting
- **✅ Configuration Examples**: Ready-to-use configurations

## 📁 Files Created/Modified

### Configuration Files

- `ecosystem.config.js` - PM2 ecosystem configuration
- `src/app/api/health/route.ts` - Enhanced health check endpoint

### Scripts

- `scripts/deploy-pm2.sh` - Automated deployment script
- `scripts/pm2-health-check.js` - Health monitoring script
- `scripts/test-pm2-config.js` - Configuration validation

### Documentation

- `docs/PM2_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `docs/PM2_QUICK_REFERENCE.md` - Quick command reference
- `docs/PM2_README.md` - This overview document

### Package.json Scripts Added

```json
{
  "scripts": {
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:reload": "pm2 reload ecosystem.config.js",
    "pm2:delete": "pm2 delete ecosystem.config.js",
    "pm2:status": "pm2 status",
    "pm2:logs": "pm2 logs",
    "pm2:monit": "pm2 monit",
    "pm2:save": "pm2 save",
    "pm2:startup": "pm2 startup",
    "deploy:prod": "pnpm build && pnpm pm2:restart",
    "deploy:fresh": "pnpm install --frozen-lockfile && npx prisma generate && npx prisma migrate deploy && pnpm build && pnpm pm2:restart",
    "deploy:script": "./scripts/deploy-pm2.sh production deploy",
    "deploy:restart": "./scripts/deploy-pm2.sh production restart",
    "deploy:status": "./scripts/deploy-pm2.sh production status",
    "deploy:logs": "./scripts/deploy-pm2.sh production logs",
    "deploy:stop": "./scripts/deploy-pm2.sh production stop",
    "test:pm2": "node scripts/test-pm2-config.js",
    "health:check": "node scripts/pm2-health-check.js check",
    "health:monitor": "node scripts/pm2-health-check.js monitor",
    "health:status": "node scripts/pm2-health-check.js status"
  }
}
```

## 🚀 Quick Start

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Test Configuration

```bash
pnpm test:pm2
```

### 3. Deploy

```bash
# Automated deployment
pnpm deploy:script

# Or manual steps
pnpm pm2:start
pnpm pm2:save
pnpm pm2:startup
```

### 4. Monitor

```bash
# Check status
pnpm pm2:status

# Health check
pnpm health:check

# View logs
pnpm pm2:logs
```

## 🔧 Configuration Highlights

### Cluster Configuration

```javascript
{
  instances: 'max',           // Use all CPU cores
  exec_mode: 'cluster',       // Cluster mode for load balancing
  max_memory_restart: '1G',   // Restart if memory exceeds 1GB
  restart_delay: 4000,        // 4 second delay between restarts
  exponential_backoff_restart_delay: 100
}
```

### Environment Support

- **Development**: Single instance, fork mode
- **Production**: Cluster mode, all CPU cores
- **Environment Variables**: Full .env.production support

### Health Monitoring

- **Endpoint**: `/api/health`
- **Checks**: Database, memory, environment
- **Response Time**: Tracked and reported
- **Status Codes**: 200 (healthy), 503 (unhealthy)

## 📊 Monitoring Features

### Process Monitoring

- Memory usage tracking
- CPU usage monitoring
- Restart count tracking
- Uptime monitoring

### Health Checks

- Database connectivity
- Environment validation
- Memory threshold monitoring
- Response time tracking

### Logging

- Structured JSON logs
- Separate error logs
- Log rotation
- Deployment logs

## 🔄 Deployment Workflow

### Production Deployment

1. **Pre-checks**: Environment, dependencies, database
2. **Build**: Install dependencies, generate Prisma client, build app
3. **Deploy**: Start/reload PM2 processes
4. **Verify**: Health checks and status monitoring
5. **Save**: Persist PM2 configuration

### Zero-downtime Updates

```bash
# Pull latest code
git pull origin main

# Update and reload (no downtime)
pnpm install --frozen-lockfile
npx prisma migrate deploy
pnpm build
pnpm pm2:reload
```

## 🛠️ Troubleshooting

### Common Commands

```bash
# Check configuration
pnpm test:pm2

# View detailed status
pnpm pm2:status
pm2 info manga-website

# Check health
pnpm health:check

# View logs
pnpm pm2:logs

# Restart if needed
pnpm pm2:restart
```

### Log Locations

- **PM2 Logs**: `./logs/pm2/`
- **Deployment**: `./logs/deployment.log`
- **Health Check**: `./logs/health-check.log`

## 🔐 Security Features

- Environment variable validation
- Process isolation in cluster mode
- Secure health endpoint
- Log file protection
- Memory limit enforcement

## 📈 Performance Benefits

- **Multi-core Utilization**: Uses all available CPU cores
- **Load Balancing**: Distributes requests across processes
- **Fault Tolerance**: Process crashes don't affect others
- **Memory Management**: Automatic restart on memory limits
- **Zero-downtime**: Reload processes without service interruption

## 🆘 Emergency Procedures

### Application Down

```bash
pnpm pm2:restart
# or
pnpm deploy:fresh
```

### High Resource Usage

```bash
pnpm health:status
pm2 scale manga-website 1  # Scale down temporarily
```

### Database Issues

```bash
pnpm health:check
npx prisma migrate deploy
pnpm pm2:restart
```

---

## 📞 Support

- **Documentation**: `docs/PM2_DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `docs/PM2_QUICK_REFERENCE.md`
- **Health Endpoint**: `http://your-domain.com/api/health`
- **PM2 Official Docs**: https://pm2.keymetrics.io/

**Status**: Production Ready ✅  
**Implementation**: Complete ✅  
**Testing**: Ready ✅

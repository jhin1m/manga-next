# 🚀 Deployment Guide - Manga Website

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ & pnpm 10.7.0+
- PostgreSQL database

## 🐳 Docker Deployment

### 1. Local Development with Docker

```bash
# Clone and setup
git clone <your-repo>
cd manga-fake

# Copy environment file
cp .env.production.example .env.production
# Edit .env.production with your values

# Build and run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 2. Production Docker Build

```bash
# Make build script executable
chmod +x scripts/docker-build.sh

# Build production image
./scripts/docker-build.sh v1.0.0

# Run production container
docker run -d \
  --name manga-app \
  -p 3000:3000 \
  --env-file .env.production \
  manga-fake:v1.0.0
```

## ☁️ Cloud Deployment

### Railway

1. **Setup Database**
   ```bash
   # Create PostgreSQL service in Railway
   # Copy DATABASE_URL from Railway dashboard
   ```

2. **Deploy Application**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and deploy
   railway login
   railway link
   railway up
   ```

3. **Environment Variables**
   Set in Railway dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Database Setup**
   - Use external PostgreSQL (Railway, Supabase, etc.)
   - Set `DATABASE_URL` in Vercel environment variables

## 🔧 Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your domain URL
- `NEXTAUTH_SECRET`: Random secret key

### Optional
- `REDIS_URL`: Redis for caching
- `LOG_LEVEL`: Logging level (info, debug, error)

## 🏥 Health Checks

The application includes a health check endpoint:
- **URL**: `/api/health`
- **Method**: GET
- **Response**: JSON with status and database connectivity

## 📊 Monitoring

### Docker Health Check
```bash
# Check container health
docker ps
docker inspect <container-id> | grep Health
```

### Application Logs
```bash
# Docker logs
docker logs -f manga-app

# Docker Compose logs
docker-compose logs -f app
```

## 🔄 Database Migrations

### Development
```bash
pnpm prisma migrate dev
```

### Production
```bash
pnpm prisma migrate deploy
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database is running
   - Check network connectivity

2. **Build Failures**
   - Ensure pnpm version compatibility
   - Check Node.js version (20+)
   - Verify all dependencies installed

3. **Permission Issues**
   - Check file permissions in Docker
   - Verify user/group settings

### Debug Commands
```bash
# Check container status
docker ps -a

# Enter container shell
docker exec -it manga-app sh

# Check database connection
docker exec -it manga-app pnpm prisma db pull

# View application logs
docker logs manga-app --tail 100 -f
```

## 📈 Performance Optimization

1. **Image Optimization**
   - Use multi-stage Docker builds
   - Minimize layer count
   - Use .dockerignore

2. **Database**
   - Enable connection pooling
   - Use read replicas for scaling
   - Implement caching with Redis

3. **CDN**
   - Use CDN for static assets
   - Optimize images with Next.js Image component

## 🔐 Security

1. **Environment Variables**
   - Never commit .env files
   - Use strong secrets
   - Rotate keys regularly

2. **Database**
   - Use SSL connections
   - Implement proper user permissions
   - Regular backups

3. **Application**
   - Keep dependencies updated
   - Use HTTPS in production
   - Implement rate limiting

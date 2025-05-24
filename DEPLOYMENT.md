# Deployment Guide

## Environment Variables

### Railway Platform Variables (Set in Railway Dashboard)
These override Dockerfile ENV statements and are used at runtime:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication (Required)
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app.railway.app

# Optional
NODE_ENV=production
```

### Build-time Variables (In Dockerfile)
These are dummy values used only during build:

```dockerfile
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
ENV NEXTAUTH_SECRET="dummy-secret-for-build"
ENV NEXTAUTH_URL="http://localhost:3000"
```

## How It Works

1. **Build Time**: Dockerfile uses dummy values to complete build
2. **Runtime**: Railway platform variables override dummy values
3. **Result**: App connects to real database at runtime

## Deployment Options

### Option 1: Dockerfile (Recommended)
- Keep current Dockerfile
- Set Railway platform variables
- Benefits: Full control, better caching, consistent builds

### Option 2: Auto-Detection
- Remove/rename Dockerfile
- Use railway.toml with build.env
- Benefits: Simpler setup, Railway handles everything

## Troubleshooting

### If build fails with DATABASE_URL error:
1. Check dummy DATABASE_URL format in Dockerfile
2. Ensure Prisma schema is valid
3. Verify all required env vars are set

### If runtime connection fails:
1. Check Railway platform variables
2. Verify DATABASE_URL format
3. Test database connectivity

## Testing Locally

```bash
# Copy environment template
cp .env.example .env.local

# Add your local values
DATABASE_URL="postgresql://localhost:5432/manga-next"
NEXTAUTH_SECRET="local-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

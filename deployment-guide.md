# Simple Deployment Guide for NextJS 15 Manga Website

This guide provides step-by-step instructions for deploying your manga website. We'll focus on **Vercel** (easiest option), with Railway and Docker as alternatives.

## 🚀 Quick Start - Vercel Deployment (Recommended)

Vercel is the easiest way to deploy NextJS applications with automatic GitHub integration.

### Step 1: Fix pnpm Version Issue

**Problem**: Vercel uses pnpm 6.35.1 but your project requires pnpm >=8.0.0

**Solution**: Update your `package.json` to be compatible with Vercel's pnpm version:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=6.35.1"
  },
  "packageManager": "pnpm@6.35.1"
}
```

**Alternative Solution** (if you need newer pnpm features):
Create a `.nvmrc` file in your project root:
```
18.17.0
```

And add this to your `package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm install -g pnpm@8.15.0 && pnpm install && pnpm build"
  }
}
```

### Step 2: Prepare Your Environment Variables

Create these environment variables (you'll add them to Vercel later):

```env
# Required for production
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXT_PUBLIC_API_URL="https://your-app-name.vercel.app"

# Optional (if using manga crawler)
MANGARAW_API_TOKEN="your-api-token"
```

### Step 3: Set Up Database

**Option A: Use Vercel Postgres (Easiest)**
1. Go to your Vercel dashboard
2. Create a new project or select existing one
3. Go to Storage tab → Create Database → Postgres
4. Vercel automatically provides the `DATABASE_URL`

**Option B: Use External Database (Supabase, Railway, etc.)**
1. Create a PostgreSQL database on your preferred service
2. Get the connection string
3. Use it as your `DATABASE_URL`

### Step 4: Deploy to Vercel

**Method 1: GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build` (or leave default)
   - **Output Directory**: `.next` (or leave default)
   - **Install Command**: `pnpm install` (or leave default)

**Method 2: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel

# Follow the prompts
```

### Step 5: Add Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Click Settings → Environment Variables
3. Add each variable:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_API_URL`
   - `MANGARAW_API_TOKEN` (if needed)

### Step 6: Set Up Database Schema

After deployment, run database migrations:

```bash
# If using Vercel CLI
vercel env pull .env.local
pnpm prisma migrate deploy

# Or run this in Vercel's function (create /api/setup route temporarily)
```

### Step 7: Test Your Deployment

Visit your Vercel URL and test:
- Homepage loads correctly
- Database connection works
- Authentication functions
- Search and favorites work

## 🛠️ Alternative Deployment Options

### Railway Deployment (Good for Full-Stack)

Railway provides both hosting and managed PostgreSQL in one place.

1. **Create Account**: Sign up at [railway.app](https://railway.app)

2. **Create New Project**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and create project
   railway login
   railway new
   ```

3. **Add PostgreSQL**:
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway automatically provides `DATABASE_URL`

4. **Configure Environment Variables**:
   ```bash
   railway variables set NEXTAUTH_SECRET=your-secret
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Docker Deployment (Advanced Users)

For those who want full control over their deployment environment.

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm prisma generate && pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

2. **Update next.config.ts**:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker
  // ... your other config
};
```

3. **Build and Run**:
```bash
docker build -t manga-website .
docker run -p 3000:3000 -e DATABASE_URL=your_db_url manga-website
```

## 🔧 Common Issues & Solutions

### pnpm Version Problems

**Issue**: `ERR_PNPM_UNSUPPORTED_ENGINE Unsupported environment (bad pnpm and/or Node.js version)`

**Solutions**:

1. **Quick Fix** - Update `package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=6.35.1"
  },
  "packageManager": "pnpm@6.35.1"
}
```

2. **Force Newer pnpm** - Add custom build script:
```json
{
  "scripts": {
    "vercel-build": "npm install -g pnpm@8.15.0 && pnpm install && pnpm build"
  }
}
```

3. **Use npm instead** - Change Vercel build settings:
   - Build Command: `npm run build`
   - Install Command: `npm install`

### Database Connection Issues

**Issue**: Database connection fails

**Solutions**:
1. Check your `DATABASE_URL` format:
```env
# Correct format
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# For SSL connections (required by most cloud databases)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

2. Ensure Prisma client is generated:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

### Build Failures

**Issue**: Build fails with TypeScript or ESLint errors

**Quick Fix** - Temporarily disable strict checks in `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Only for deployment emergencies
  },
  eslint: {
    ignoreDuringBuilds: true, // Only for deployment emergencies
  },
};
```

**Better Solution** - Fix the actual errors:
```bash
# Check for TypeScript errors
pnpm run build

# Fix ESLint issues
pnpm run lint --fix
```

### Environment Variables Not Working

**Issue**: Environment variables are undefined in production

**Solutions**:
1. Make sure variable names are correct (case-sensitive)
2. Public variables must start with `NEXT_PUBLIC_`
3. Restart your deployment after adding new variables
4. Check that `NEXTAUTH_URL` exactly matches your domain

### Prisma Migration Issues

**Issue**: Database schema doesn't match

**Solutions**:
```bash
# Reset database (development only!)
pnpm prisma migrate reset

# Deploy migrations to production
pnpm prisma migrate deploy

# Check migration status
pnpm prisma migrate status
```

## ✅ Quick Testing Checklist

After deployment, test these features:

### Basic Functionality
- [ ] Homepage loads without errors
- [ ] Navigation works correctly
- [ ] Images display properly

### Database Features
- [ ] Manga list loads with data
- [ ] Individual manga pages work
- [ ] Search functionality works
- [ ] Pagination works

### Authentication (if implemented)
- [ ] Login/logout works
- [ ] User sessions persist
- [ ] Protected routes work correctly

### API Endpoints
Test these URLs (replace with your domain):
```bash
# Basic API health
https://your-domain.com/api/manga

# Search API
https://your-domain.com/api/search?q=test

# Authentication API
https://your-domain.com/api/auth/session
```

## 🎯 Essential Tips

### 1. Generate a Strong Secret
```bash
# Generate a secure NEXTAUTH_SECRET
openssl rand -base64 32
```

### 2. Database Connection String Format
```env
# Local development
DATABASE_URL="postgresql://username:password@localhost:5432/manga-next"

# Production (with SSL)
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### 3. Environment Variable Naming
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Keep server-side secrets without the prefix
- Use UPPERCASE with underscores

### 4. Quick Deployment Commands
```bash
# Vercel
vercel --prod

# Railway
railway up

# Check deployment status
vercel ls  # for Vercel
railway status  # for Railway
```

---

## 📝 Summary

**Recommended Deployment Path**:
1. Fix pnpm version in `package.json`
2. Set up Vercel Postgres database
3. Deploy via GitHub integration
4. Add environment variables in Vercel dashboard
5. Test your deployment

**If Vercel doesn't work**: Try Railway for a simpler full-stack solution with built-in PostgreSQL.

**For advanced users**: Use Docker for complete control over your deployment environment.

Remember: Start simple with Vercel, then move to more complex solutions only if needed!
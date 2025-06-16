# Deploy Guide

## Local Development

```bash
# Install dependencies
pnpm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
pnpm dev
```

## Docker Deployment (Recommended)

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t manga-website .

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/manga-next" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  manga-website
```

### Docker Compose (Development)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/manga-next
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=manga-next
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

volumes:
  postgres_data:
```

## Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set NEXTAUTH_SECRET="your-secret-key"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
```

## Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

## Production Build (Manual)

```bash
# Build project
pnpm build

# Start production server
pnpm start
```

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Push schema to database
npx prisma db push

# Reset database (careful!)
npx prisma db reset

# View database
npx prisma studio
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Your application URL

Optional:

- `SEED_DATABASE=true`: Enable database seeding on startup
- `NODE_ENV=production`: Set to production mode

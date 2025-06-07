# Hướng Dẫn Chạy Dự Án Manga Website

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0  
- **PostgreSQL**: >= 13

---

## 🚀 Cài Đặt Dự Án

### 1. Clone Repository
```bash
git clone YOUR_REPO_URL
cd manga-website
```

### 2. Cài Đặt Dependencies
```bash
pnpm install
```

### 3. Tạo Environment File
```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/manga-next"
NEXTAUTH_SECRET="your-super-secret-key-for-nextauth-jwt-encryption"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 🗄️ Chạy Database

### 1. Tạo Database PostgreSQL
```bash
# Tạo database
createdb manga-next

# Hoặc qua psql
psql -U postgres
CREATE DATABASE manga_next;
\q
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Chạy Migrations
```bash
# Development
npx prisma db push

# Production
npx prisma migrate deploy
```

### 4. Seed Data (Tùy chọn)
```bash
pnpm seed
```

---

## 🏗️ Build Dự Án

### Development Build
```bash
pnpm dev
```

### Production Build
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

---

## 🔧 Commands Hữu Ích

### Database Commands
```bash
# Xem database trong browser
npx prisma studio

# Reset database
npx prisma db reset

# Generate client sau khi thay đổi schema
npx prisma generate

# Tạo migration mới
npx prisma migrate dev --name your_migration_name
```

### Development Commands
```bash
# Chạy dev server với turbopack
pnpm dev

# Lint code
pnpm lint

# Format code
prettier --write .

# Test các script
pnpm test:revalidation
pnpm test:view-stats
pnpm test:rankings
```

### Build Commands
```bash
# Build cho production
pnpm build

# Start production server
pnpm start

# Analyze bundle size
pnpm build && npx @next/bundle-analyzer
```

---

## 🌐 Deploy Production

### 1. Chuẩn Bị VPS
```bash
# Cài đặt Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cài đặt pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Cài đặt PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Cài đặt PM2
npm install -g pm2

# Cài đặt Nginx
sudo apt install -y nginx
```

### 2. Setup Database Production
```bash
sudo -u postgres psql
CREATE DATABASE manga_production;
CREATE USER manga_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE manga_production TO manga_user;
\q
```

### 3. Deploy Application
```bash
# Clone code
git clone YOUR_REPO_URL
cd manga-website

# Install dependencies
pnpm install --frozen-lockfile

# Tạo .env.production
cp .env.example .env.production
# Edit với thông tin production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
pnpm build

# Start với PM2 (Production-ready configuration)
pnpm pm2:start
pnpm pm2:save
pnpm pm2:startup

# Or use automated deployment script
pnpm deploy:script
```

### 4. Setup Nginx
Tạo file `/etc/nginx/sites-available/manga-website`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/manga-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup SSL
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test renewal
sudo certbot renew --dry-run
```

---

## 🔄 Update Production

```bash
# Pull latest code
git pull origin main

# Install new dependencies
pnpm install --frozen-lockfile

# Generate Prisma client
npx prisma generate

# Run new migrations
npx prisma migrate deploy

# Build application
pnpm build

# Restart PM2
pm2 restart manga-website
```

---

## 🛠️ Troubleshooting

### Database Issues
```bash
# Check database connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Check search vectors
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Comics\" WHERE search_vector IS NOT NULL;"

# Rebuild search vectors nếu cần
npx prisma db execute --stdin <<< "
UPDATE \"Comics\" SET search_vector = 
    setweight(to_tsvector('simple'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, coalesce(cast(alternative_titles as text), '')), 'C')
WHERE search_vector IS NULL;
"
```

### Application Issues
```bash
# Check if app is running
curl http://localhost:3000

# Check PM2 status
pm2 status
pm2 logs manga-website

# Restart application
pm2 restart manga-website

# Check system resources
free -h
df -h
```

### Migration Issues
```bash
# Nếu migration fail với P3005 error
sudo -u postgres psql
CREATE DATABASE manga_production_shadow OWNER manga_user;
\q

# Retry migration
npx prisma migrate deploy

# Nếu vẫn fail, dùng push (cẩn thận - có thể mất data)
npx prisma db push --accept-data-loss
```

---

## 📝 Environment Variables

### Development (.env.local)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/manga-next"
NEXTAUTH_SECRET="your-super-secret-key-for-nextauth-jwt-encryption"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Production (.env.production)
```env
DATABASE_URL="postgresql://manga_user:your_secure_password@localhost:5432/manga_production"
NEXTAUTH_SECRET="your-super-secure-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
```

---

## 🎯 Quick Start Summary

### Development
```bash
pnpm install
npx prisma generate
npx prisma db push
pnpm dev
```

### Production (PM2)
```bash
# Quick deployment
pnpm deploy:script

# Manual steps
pnpm install --frozen-lockfile
npx prisma generate
npx prisma migrate deploy
pnpm build
pnpm pm2:start
pnpm pm2:save

# Health monitoring
pnpm health:check
```

**Lưu ý**: Đảm bảo PostgreSQL đang chạy và database đã được tạo trước khi chạy các lệnh Prisma.

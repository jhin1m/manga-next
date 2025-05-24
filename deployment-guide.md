# Hướng Dẫn Triển Khai Toàn Diện - Trang Web Manga NextJS 15

## 📋 Mục Lục
1. [Điều Kiện Tiên Quyết](#điều-kiện-tiên-quyết)
2. [Thiết Lập Môi Trường](#thiết-lập-môi-trường)
3. [Quy Trình Xây Dựng](#quy-trình-xây-dựng)
4. [Các Bước Triển Khai](#các-bước-triển-khai)
5. [Cân Nhắc Về Cơ Sở Dữ Liệu](#cân-nhắc-về-cơ-sở-dữ-liệu)
6. [Xác Minh Sau Khi Triển Khai](#xác-minh-sau-khi-triển-khai)

## 🔧 Điều Kiện Tiên Quyết

### Phiên Bản Phần Mềm Bắt Buộc
- **Node.js**: 18.17 hoặc mới hơn (khuyến nghị 20.x LTS)
- **npm**: 9.x hoặc mới hơn
- **PostgreSQL**: 13.x hoặc mới hơn
- **Git**: Phiên bản mới nhất

### Kiểm Tra Phiên Bản
```bash
node --version    # >= 18.17
npm --version     # >= 9.0
psql --version    # >= 13.0
git --version
```

## 🌍 Thiết Lập Môi Trường

### Biến Môi Trường Cho Production

Tạo file `.env.production` với các biến sau:

```env
# Node Environment
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-production-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="https://your-domain.com"

# API Configuration
NEXT_PUBLIC_API_URL="https://your-domain.com"

# External API (nếu sử dụng)
MANGARAW_API_TOKEN="your-production-api-token"

# Optional: Email Configuration (cho reset password)
EMAIL_SERVER="smtp://username:password@smtp.provider.com:587"
EMAIL_FROM="noreply@your-domain.com"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Bảo Mật Biến Môi Trường
- **Không bao giờ** commit file `.env` vào repository
- Sử dụng secrets management của platform hosting
- Tạo NEXTAUTH_SECRET mạnh: `openssl rand -base64 32`

## 🏗️ Quy Trình Xây Dựng

### 1. Chuẩn Bị Mã Nguồn
```bash
# Clone repository
git clone <your-repo-url>
cd manga-fake

# Checkout branch production (nếu có)
git checkout main
git pull origin main
```

### 2. Cài Đặt Dependencies
```bash
# Cài đặt dependencies
npm ci --production=false

# Hoặc sử dụng yarn
yarn install --frozen-lockfile
```

### 3. Thiết Lập Database
```bash
# Generate Prisma client
npx prisma generate

# Chạy migrations (production database)
npx prisma migrate deploy

# Seed data (nếu cần)
npm run seed
```

### 4. Build Application
```bash
# Build ứng dụng cho production
npm run build

# Kiểm tra build thành công
npm run start
```

### 5. Tối Ưu Hóa Build
```bash
# Phân tích bundle size (optional)
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

## 🚀 Các Bước Triển Khai

### Option 1: Triển Khai Lên Vercel (Khuyến Nghị)

#### Bước 1: Chuẩn Bị
```bash
# Cài đặt Vercel CLI
npm install -g vercel

# Login vào Vercel
vercel login
```

#### Bước 2: Cấu Hình Project
```bash
# Khởi tạo project
vercel

# Thiết lập environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXT_PUBLIC_API_URL
```

#### Bước 3: Deploy
```bash
# Deploy lên production
vercel --prod

# Hoặc sử dụng Git integration (khuyến nghị)
git push origin main
```

### Option 2: Triển Khai Lên VPS/Server

#### Bước 1: Chuẩn Bị Server
```bash
# Cập nhật system
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2
sudo npm install -g pm2
```

#### Bước 2: Deploy Application
```bash
# Upload code lên server
rsync -avz --exclude node_modules . user@server:/path/to/app

# Trên server
cd /path/to/app
npm ci --production
npm run build
```

#### Bước 3: Chạy với PM2
```bash
# Tạo ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'manga-website',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 3: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
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

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: manga-next
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🗄️ Cân Nhắc Về Cơ Sở Dữ Liệu

### 1. Database Migration
```bash
# Chạy migrations trên production database
npx prisma migrate deploy

# Kiểm tra trạng thái migrations
npx prisma migrate status
```

### 2. Database Connection Pool
Đối với production, cấu hình connection pooling:
```env
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public&connection_limit=10&pool_timeout=20"
```

### 3. Backup Strategy
```bash
# Tạo backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql

# Cron job cho backup hàng ngày
0 2 * * * /path/to/backup-script.sh
```

### 4. Database Optimization
- Tạo indexes cho các trường tìm kiếm thường xuyên
- Sử dụng connection pooling (PgBouncer)
- Monitor query performance

## ✅ Xác Minh Sau Khi Triển Khai

### 1. Health Checks
```bash
# Kiểm tra application status
curl -f https://your-domain.com/api/health || exit 1

# Kiểm tra database connection
curl -f https://your-domain.com/api/manga?limit=1 || exit 1
```

### 2. Functional Testing
- [ ] Trang chủ load thành công
- [ ] API endpoints hoạt động:
  - `/api/manga` - Danh sách manga
  - `/api/manga/[slug]` - Chi tiết manga
  - `/api/search` - Tìm kiếm
  - `/api/chapters/[id]` - Nội dung chapter
- [ ] Authentication system:
  - Đăng ký tài khoản
  - Đăng nhập/đăng xuất
  - Protected routes
- [ ] Database operations:
  - Đọc dữ liệu
  - Ghi dữ liệu (favorites, comments)
  - Search functionality

### 3. Performance Monitoring
```bash
# Kiểm tra response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Monitor memory usage
free -h
```

### 4. Security Checklist
- [ ] HTTPS được kích hoạt
- [ ] Environment variables được bảo mật
- [ ] Database credentials được mã hóa
- [ ] CORS được cấu hình đúng
- [ ] Rate limiting được thiết lập

### 5. SEO và Performance
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt configured: `/robots.txt`
- [ ] Meta tags hiển thị đúng
- [ ] Images được optimize
- [ ] Page load speed < 3s

## 🔧 Troubleshooting

### Lỗi Thường Gặp

#### 1. Database Connection Error
```bash
# Kiểm tra connection string
npx prisma db pull

# Test database connectivity
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. Build Errors
```bash
# Clear cache và rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Environment Variables
```bash
# Kiểm tra env vars được load
node -e "console.log(process.env.DATABASE_URL)"
```

### Monitoring và Logs
```bash
# PM2 logs
pm2 logs manga-website

# Vercel logs
vercel logs

# Docker logs
docker logs container-name
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề trong quá trình triển khai:
1. Kiểm tra logs chi tiết
2. Xác minh environment variables
3. Test database connectivity
4. Kiểm tra network và firewall settings

---

**Lưu ý**: Hướng dẫn này được thiết kế cho dự án manga website sử dụng NextJS 15, ShadcnUI, Prisma ORM và PostgreSQL. Điều chỉnh theo nhu cầu cụ thể của môi trường production.

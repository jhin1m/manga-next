# 🚀 Production Update Guide

Hướng dẫn chi tiết cập nhật dự án manga website trên môi trường production một cách an toàn.

## 📋 Tổng Quan Quy Trình

### 1. **Chuẩn Bị (Development)**
- Tạo migration cho database mới
- Test migration trên local
- Build và test ứng dụng
- Commit và push code

### 2. **Cập Nhật (Production)**
- Backup database
- Pull code mới
- Rolling update với zero-downtime
- Verify và cleanup

## 🛠️ Các Lệnh Cập Nhật

### **Cập Nhật Tự Động (Khuyến Nghị)**
```bash
# Trên VPS production
./scripts/update-production.sh
```

### **Cập Nhật Thủ Công**
```bash
# 1. Backup database
docker exec manga-fake-db-1 pg_dump -U postgres manga-next > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull code mới
git pull origin main

# 3. Rolling update
docker compose -f docker-compose.prod.yml stop app
docker compose -f docker-compose.prod.yml build app --no-cache
docker compose -f docker-compose.prod.yml up -d app

# 4. Verify
curl http://localhost:3000/api/health
```

## 🔄 Các Tình Huống Cập Nhật

### **A. Chỉ Cập Nhật Code (Không Có Database Changes)**
```bash
# Simple restart
docker compose -f docker-compose.prod.yml restart app
```

### **B. Cập Nhật Code + Database Schema**
```bash
# Full rolling update với migration
./scripts/update-production.sh
```

### **C. Cập Nhật Dependencies**
```bash
# Rebuild với dependencies mới
docker compose -f docker-compose.prod.yml build app --no-cache
docker compose -f docker-compose.prod.yml up -d app
```

## 🗄️ Database Migration Strategy

### **Migration Tự Động**
- Prisma migrations chạy tự động qua `docker-entrypoint.sh`
- Fallback sang `prisma db push` nếu migration fail
- Backup tự động trước khi migration

### **Migration Thủ Công (Nếu Cần)**
```bash
# Chạy migration trong container
docker exec manga-fake-app-1 npx prisma migrate deploy

# Hoặc push schema trực tiếp
docker exec manga-fake-app-1 npx prisma db push
```

## 🔙 Rollback Strategy

### **Rollback Code**
```bash
# Quay về commit trước
git reset --hard HEAD~1
./scripts/update-production.sh
```

### **Rollback Database**
```bash
# Restore từ backup
docker exec -i manga-fake-db-1 psql -U postgres manga-next < backup_YYYYMMDD_HHMMSS.sql
```

## 📊 Monitoring & Verification

### **Health Checks**
```bash
# Application health
curl http://localhost:3000/api/health

# Database connection
docker exec manga-fake-app-1 npx prisma db execute --stdin --schema=prisma/schema.prisma <<< "SELECT 1;"

# Container status
docker compose -f docker-compose.prod.yml ps
```

### **Logs Monitoring**
```bash
# Application logs
docker compose -f docker-compose.prod.yml logs -f app

# Database logs
docker compose -f docker-compose.prod.yml logs -f db

# All services
docker compose -f docker-compose.prod.yml logs -f
```

## ⚠️ Best Practices

### **Trước Khi Cập Nhật**
1. ✅ **Luôn backup database**
2. ✅ **Test migration trên local trước**
3. ✅ **Kiểm tra disk space trên VPS**
4. ✅ **Thông báo downtime (nếu có)**

### **Trong Quá Trình Cập Nhật**
1. ✅ **Monitor logs real-time**
2. ✅ **Verify health checks**
3. ✅ **Test critical features**
4. ✅ **Keep backup accessible**

### **Sau Khi Cập Nhật**
1. ✅ **Cleanup old Docker images**
2. ✅ **Remove old backups (keep 5 recent)**
3. ✅ **Update documentation**
4. ✅ **Monitor performance**

## 🚨 Troubleshooting

### **Migration Fails**
```bash
# Check migration status
docker exec manga-fake-app-1 npx prisma migrate status

# Reset and retry
docker exec manga-fake-app-1 npx prisma migrate reset --force
docker exec manga-fake-app-1 npx prisma db push
```

### **Application Won't Start**
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Check environment variables
docker exec manga-fake-app-1 env | grep -E "(DATABASE_URL|NEXTAUTH)"

# Restart with fresh build
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### **Database Connection Issues**
```bash
# Check database status
docker compose -f docker-compose.prod.yml ps db

# Test connection
docker exec manga-fake-db-1 pg_isready -U postgres

# Check network
docker network ls
docker network inspect manga-fake_manga-network
```

## 📁 File Structure

```
manga-fake/
├── scripts/
│   ├── deploy-production.sh      # Initial deployment
│   └── update-production.sh      # Production updates
├── docker-compose.prod.yml       # Production compose
├── Dockerfile                    # Multi-stage build
├── docker-entrypoint.sh         # Auto migration
└── docs/
    └── production-update-guide.md # This guide
```

## 🔗 Related Commands

```bash
# Environment management
cp .env.example .env.production
cp .env.db.example .env.production.db

# Docker management
docker system prune -f
docker volume ls
docker network ls

# Git management
git status
git log --oneline -10
git diff HEAD~1 HEAD --name-only
```

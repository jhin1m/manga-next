# 🚀 Production Deployment Guide

Hướng dẫn triển khai production hiệu quả cho Manga Website với NextJS 15 + Docker + PostgreSQL.

## 📋 Tổng quan

### 🎯 Mục tiêu
- **Tối ưu thời gian deployment**: Chỉ rebuild những gì cần thiết
- **Tự động hóa migrations**: Database tự động cập nhật khi có schema mới
- **Zero-downtime**: Giảm thiểu thời gian ngừng hoạt động
- **Backup tự động**: Bảo vệ dữ liệu trước khi deployment

### 🛠️ Công cụ
- **Smart Deployment Script**: Tự động phát hiện thay đổi
- **Database Management**: Quản lý migrations và backup
- **Docker Multi-stage**: Tối ưu build time và image size

## 🚀 Cách sử dụng

### 1. Cập nhật Source Code + Deployment thông minh

```bash
# Deployment thông minh (tự động phát hiện thay đổi)
./scripts/deploy-production.sh

# Chỉ restart nhanh (không rebuild)
./scripts/deploy-production.sh --quick

# Force rebuild toàn bộ
./scripts/deploy-production.sh --full-rebuild

# Backup database trước khi deploy
./scripts/deploy-production.sh --backup-db
```

### 2. Quản lý Database

```bash
# Apply migrations mới
./scripts/manage-database.sh migrate

# Tạo backup
./scripts/manage-database.sh backup

# Xem trạng thái migrations
./scripts/manage-database.sh status

# Seed dữ liệu
./scripts/manage-database.sh seed
```

## 📊 Các tình huống thường gặp

### 🔄 Cập nhật code thông thường
```bash
# 1. Pull code mới
git pull origin main

# 2. Deploy thông minh (script tự động phát hiện thay đổi)
./scripts/deploy-production.sh
```
**Thời gian**: ~30-60 giây (chỉ rebuild app)

### 🗄️ Có bảng database mới
```bash
# 1. Tạo migration (development)
npx prisma migrate dev --name add_new_table

# 2. Commit và push
git add prisma/migrations/
git commit -m "Add new table migration"
git push

# 3. Deploy (migrations tự động chạy)
./scripts/deploy-production.sh
```
**Thời gian**: ~1-2 phút (rebuild + migration)

### 📦 Thay đổi dependencies
```bash
# Script tự động phát hiện thay đổi package.json
./scripts/deploy-production.sh
# Hoặc force rebuild
./scripts/deploy-production.sh --full-rebuild
```
**Thời gian**: ~3-5 phút (full rebuild)

### ⚡ Chỉ restart nhanh
```bash
# Khi chỉ cần restart service (không có thay đổi code)
./scripts/deploy-production.sh --quick
```
**Thời gian**: ~10-15 giây

## 🔍 Monitoring & Troubleshooting

### Kiểm tra trạng thái
```bash
# Xem logs
docker compose logs -f app

# Kiểm tra health
curl http://localhost:3000/api/health

# Xem trạng thái containers
docker compose ps
```

### Backup & Restore
```bash
# Tạo backup
./scripts/manage-database.sh backup

# Restore từ backup
./scripts/manage-database.sh restore --file backups/backup-file.sql
```

## 🎛️ Tối ưu hóa

### Docker Layer Caching
- Dependencies chỉ rebuild khi `package.json` thay đổi
- Source code rebuild độc lập với dependencies
- Multi-stage builds giảm image size

### Smart Detection
Script tự động phát hiện:
- ✅ Thay đổi `package.json` → Full rebuild
- ✅ Thay đổi `Dockerfile` → Full rebuild  
- ✅ Thay đổi `prisma/schema.prisma` → Rebuild + migration
- ✅ Chỉ thay đổi source code → Quick rebuild
- ✅ Không có thay đổi → Quick restart

### Database Migrations
- Tự động chạy `prisma migrate deploy`
- Fallback sang `prisma db push` nếu migration lỗi
- Backup tự động trước khi thay đổi lớn

## 🔧 Cấu hình

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/manga-next
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional
SEED_DATABASE=false
```

### Docker Compose
Sử dụng `docker-compose.yml` cho production với:
- PostgreSQL 15 Alpine
- Redis cho caching
- Health checks
- Volume persistence

## 📈 Performance Tips

### 1. Sử dụng đúng deployment mode
- **Quick mode**: Chỉ restart → 10-15s
- **Smart mode**: Auto-detect → 30s-2m  
- **Full rebuild**: Toàn bộ → 3-5m

### 2. Backup strategy
- Backup tự động trước deployment lớn
- Giữ 10 backup gần nhất
- Backup nén để tiết kiệm dung lượng

### 3. Monitoring
- Health check với retry logic
- Log aggregation
- Performance metrics

## 🚨 Troubleshooting

### Deployment fails
```bash
# Xem logs chi tiết
docker compose logs app

# Kiểm tra database
./scripts/manage-database.sh status

# Force rebuild
./scripts/deploy-production.sh --full-rebuild
```

### Database issues
```bash
# Kiểm tra migrations
npx prisma migrate status

# Reset database (NGUY HIỂM)
./scripts/manage-database.sh reset --force

# Restore từ backup
./scripts/manage-database.sh restore --file backup.sql
```

### Performance issues
```bash
# Xem resource usage
docker stats

# Clean unused images
docker image prune -f

# Restart services
docker compose restart
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker compose logs -f app`
2. Verify health: `curl http://localhost:3000/api/health`
3. Check database: `./scripts/manage-database.sh status`
4. Backup data: `./scripts/manage-database.sh backup`

---

**Lưu ý**: Luôn tạo backup trước khi thực hiện thay đổi lớn trong production!

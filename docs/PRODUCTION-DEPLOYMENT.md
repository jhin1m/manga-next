# 🚀 Production Deployment Guide

Hướng dẫn đơn giản để deploy Manga Website lên production.

## 📋 Chỉ cần nhớ 2 script:

### 1. **Deploy Application** - `./scripts/deploy-production.sh`
### 2. **Manage Database** - `./scripts/manage-database.sh`

---

## 🚀 Deployment thông thường

### **Cập nhật code mới:**
```bash
git pull origin main
./scripts/deploy-production.sh
```
**→ Thời gian: 30-60 giây**

### **Chỉ restart nhanh:**
```bash
./scripts/deploy-production.sh --quick
```
**→ Thời gian: 10-15 giây**

### **Force rebuild toàn bộ:**
```bash
./scripts/deploy-production.sh --full-rebuild
```
**→ Thời gian: 3-5 phút**

---

## 🗄️ Quản lý Database

### **Khi có bảng mới (migration):**
```bash
# Development: tạo migration
npx prisma migrate dev --name add_new_table
git add prisma/migrations/ && git commit && git push

# Production: deploy tự động apply migration
./scripts/deploy-production.sh
```

### **Sửa lỗi P3005 migration:**
```bash
./scripts/manage-database.sh fix-baseline
```

### **Backup & Restore:**
```bash
# Tạo backup
./scripts/manage-database.sh backup

# Restore từ backup
./scripts/manage-database.sh restore --file backup.sql

# Xem trạng thái
./scripts/manage-database.sh status
```

---

## � Troubleshooting

### **Khi deployment lỗi:**
```bash
# Xem logs
docker compose logs -f app

# Force rebuild
./scripts/deploy-production.sh --full-rebuild
```

### **Khi có lỗi P3005 migration:**
```bash
# Sửa lỗi migration baseline
./scripts/manage-database.sh fix-baseline

# Sau đó deploy lại
./scripts/deploy-production.sh
```

### **Khôi phục dữ liệu:**
```bash
# Restore từ backup
./scripts/manage-database.sh restore --file backup.sql

# Hoặc seed lại data
./scripts/manage-database.sh seed
```

---

## 📊 Thời gian deployment

| Tình huống | Thời gian | Lệnh |
|------------|-----------|------|
| Chỉ restart | 10-15s | `./scripts/deploy-production.sh --quick` |
| Code thay đổi | 30-60s | `./scripts/deploy-production.sh` |
| Dependencies mới | 3-5m | `./scripts/deploy-production.sh --full-rebuild` |
| Database mới | 1-2m | `./scripts/deploy-production.sh` (auto-detect) |

---

## � Kiểm tra hệ thống

```bash
# Xem logs
docker compose logs -f app

# Kiểm tra health
curl http://localhost:3000/api/health

# Xem trạng thái containers
docker compose ps

# Kiểm tra database
./scripts/manage-database.sh status
```

---

## ⚠️ Lưu ý quan trọng

- ✅ **Luôn backup** trước khi deploy: `./scripts/manage-database.sh backup`
- ✅ **Data an toàn**: Script tự động dừng nếu có nguy cơ mất data
- ✅ **Auto-detection**: Script tự biết cần rebuild gì
- ✅ **Rollback**: Có thể restore từ backup nếu cần

**Chỉ cần nhớ 2 script chính là đủ!** 🎉

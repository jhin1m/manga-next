# 🐳 Docker Troubleshooting Guide

## ✅ Đã sửa lỗi pnpm-lock.yaml

### Vấn đề gốc:
```
ERR_PNPM_NO_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
```

### Giải pháp đã áp dụng:

1. **Cập nhật Dockerfile** để không yêu cầu lockfile:
   ```dockerfile
   # Thay vì sử dụng --frozen-lockfile
   RUN pnpm install --prod=false
   ```

2. **Tạo .pnpmrc** để cấu hình pnpm:
   ```
   lockfile=true
   auto-install-peers=true
   save-exact=true
   hoist=true
   ```

3. **Cập nhật .dockerignore** để bao gồm config files:
   ```
   !.pnpmrc
   !pnpm-workspace.yaml
   ```

## 🚀 Cách test Docker build

### 1. Khởi động Docker Desktop
```bash
# Kiểm tra Docker đang chạy
docker info
```

### 2. Build image
```bash
# Sử dụng script build
./scripts/docker-build.sh

# Hoặc build thủ công
docker build -t manga-fake:latest .
```

### 3. Test chạy container
```bash
# Chạy với environment variables
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-secret" \
  manga-fake:latest
```

## 🔧 Các lỗi thường gặp

### 1. Docker daemon not running
```
ERROR: Cannot connect to the Docker daemon
```
**Giải pháp:** Khởi động Docker Desktop

### 2. Platform compatibility
```
WARNING: The requested image's platform (linux/amd64) does not match
```
**Giải pháp:** Thêm `--platform linux/amd64` vào docker build

### 3. Prisma client generation failed
```
Error: Prisma Client could not be generated
```
**Giải pháp:** Đảm bảo DATABASE_URL được set trong build time

### 4. Permission denied
```
EACCES: permission denied
```
**Giải pháp:** Dockerfile đã sử dụng non-root user (nextjs:nodejs)

## 📋 Checklist trước khi build

- [ ] Docker Desktop đang chạy
- [ ] File .env.production đã được tạo
- [ ] DATABASE_URL hợp lệ
- [ ] Port 3000 không bị sử dụng
- [ ] Đủ dung lượng disk (>2GB)

## 🐛 Debug commands

```bash
# Kiểm tra logs container
docker logs <container-id>

# Vào shell container
docker exec -it <container-id> sh

# Kiểm tra Prisma client
docker exec -it <container-id> npx prisma generate

# Test database connection
docker exec -it <container-id> npx prisma db pull

# Kiểm tra health endpoint
curl http://localhost:3000/api/health
```

## 📊 Performance tips

1. **Multi-stage build** đã được sử dụng để giảm kích thước image
2. **Layer caching** được tối ưu bằng cách copy package.json trước
3. **Non-root user** để tăng security
4. **Health check** để monitoring

## 🌐 Production deployment

### Railway
```bash
railway login
railway link
railway up
```

### Vercel (với external DB)
```bash
vercel --prod
```

### Manual Docker deployment
```bash
# Build for production
docker build --platform linux/amd64 -t manga-fake:prod .

# Push to registry
docker tag manga-fake:prod your-registry/manga-fake:prod
docker push your-registry/manga-fake:prod

# Deploy on server
docker pull your-registry/manga-fake:prod
docker run -d --name manga-app \
  -p 3000:3000 \
  --env-file .env.production \
  your-registry/manga-fake:prod
```

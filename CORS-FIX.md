# ✅ CORS Fix - Hoàn thành

## Những gì đã được thực hiện

### 1. 🛠️ Tạo CORS Library (`src/lib/cors.ts`)
- **withCors()** wrapper cho API routes
- **getCorsHeaders()** tạo CORS headers tự động
- **handlePreflight()** xử lý OPTIONS requests
- **corsResponse()** tạo response với CORS headers
- Cấu hình bảo mật cho production và development

### 2. ⚙️ Cập nhật Next.js Config (`next.config.ts`)
- Thêm CORS headers cho tất cả `/api/*` routes
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Cấu hình khác nhau cho development và production

### 3. 🔧 Cập nhật Middleware (`middleware.ts`)
- Xử lý preflight OPTIONS requests
- Tích hợp CORS với internationalization middleware
- Thêm CORS headers vào tất cả API responses

### 4. 📝 Cập nhật API Routes
- **`/api/manga`** - Sử dụng withCors wrapper
- **`/api/search`** - Sử dụng withCors wrapper
- Template cho các routes khác

### 5. 🧪 Testing Tools
- **`scripts/test-cors.js`** - Script test CORS configuration
- **`pnpm test:cors`** - Command để chạy test
- **`docs/cors-setup.md`** - Hướng dẫn chi tiết

## Cách sử dụng

### Cho API Routes mới:
```typescript
import { withCors } from '@/lib/cors'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withCors(async (request: NextRequest) => {
  return NextResponse.json({ message: 'Hello World' })
})
```

### Test CORS:
```bash
# Test với localhost
pnpm test:cors

# Test với domain khác
TEST_ORIGIN=https://yourdomain.com pnpm test:cors
```

## Cấu hình Production

### Environment Variables:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
VERCEL_URL=your-app.vercel.app
```

### Hoặc chỉnh sửa trực tiếp trong `src/lib/cors.ts`:
```typescript
origins: [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  // Thêm domains khác
]
```

## Kiểm tra CORS hoạt động

### 1. Chạy development server:
```bash
pnpm dev
```

### 2. Test CORS:
```bash
pnpm test:cors
```

### 3. Kiểm tra trong browser:
```javascript
// Mở browser console và test
fetch('http://localhost:3000/api/manga', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(data => console.log('✅ CORS working:', data))
.catch(error => console.error('❌ CORS error:', error))
```

## Troubleshooting

### Nếu vẫn gặp lỗi CORS:

1. **Kiểm tra console logs** - Xem có error nào từ CORS middleware
2. **Verify domain** - Đảm bảo domain có trong danh sách allowed origins
3. **Check headers** - Sử dụng browser DevTools để xem CORS headers
4. **Test với curl**:
   ```bash
   curl -X OPTIONS \
     -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     http://localhost:3000/api/manga
   ```

### Lỗi phổ biến:

- **"Access to fetch blocked by CORS"** → Thêm domain vào origins list
- **"Preflight request failed"** → Kiểm tra OPTIONS handler
- **"Credentials not allowed"** → Không dùng wildcard (*) với credentials

## Migration cho API Routes hiện có

### Trước:
```typescript
export async function GET(request: Request) {
  // logic
}
```

### Sau:
```typescript
export const GET = withCors(async (request: NextRequest) => {
  // logic
})
```

## 🎉 Kết quả

- ✅ CORS được cấu hình đầy đủ cho toàn bộ API
- ✅ Hỗ trợ preflight requests (OPTIONS)
- ✅ Security headers được thêm vào
- ✅ Tương thích với internationalization
- ✅ Tools để test và debug CORS
- ✅ Documentation đầy đủ

**CORS đã được fix hoàn toàn! 🚀**

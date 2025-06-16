# CORS Configuration Guide

## Tổng quan

Dự án đã được cấu hình CORS (Cross-Origin Resource Sharing) để xử lý các request từ các domain khác nhau. Hệ thống CORS được thiết lập ở nhiều tầng để đảm bảo tính bảo mật và linh hoạt.

## Cấu trúc CORS

### 1. CORS Library (`src/lib/cors.ts`)

File này chứa tất cả logic xử lý CORS:

- **CORS_CONFIG**: Cấu hình các domain được phép, methods, headers
- **withCors()**: Wrapper function cho API routes
- **getCorsHeaders()**: Tạo CORS headers
- **handlePreflight()**: Xử lý OPTIONS requests

### 2. Next.js Config (`next.config.ts`)

Cấu hình headers CORS ở tầng Next.js:

- Headers cho tất cả API routes (`/api/:path*`)
- Security headers cho toàn bộ ứng dụng
- Cấu hình khác nhau cho development và production

### 3. Middleware (`middleware.ts`)

Xử lý CORS ở tầng middleware:

- Xử lý preflight OPTIONS requests
- Thêm CORS headers vào responses
- Tích hợp với internationalization middleware

## Cách sử dụng

### Cho API Routes mới

```typescript
import { withCors } from '@/lib/cors';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withCors(async (request: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ data: 'Hello World' });
});

export const POST = withCors(async (request: NextRequest) => {
  // Your API logic here
  return NextResponse.json({ success: true });
});
```

### Cho responses tùy chỉnh

```typescript
import { corsResponse } from '@/lib/cors';

export const GET = withCors(async (request: NextRequest) => {
  const data = { message: 'Custom response' };

  return corsResponse(data, request, {
    status: 200,
    headers: {
      'X-Custom-Header': 'value',
    },
  });
});
```

## Cấu hình Domain

### Development

Trong development, tất cả origins được cho phép (`*`).

### Production

Cần cấu hình các environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
VERCEL_URL=your-vercel-app.vercel.app
```

Hoặc chỉnh sửa trực tiếp trong `src/lib/cors.ts`:

```typescript
origins: [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://admin.yourdomain.com',
  // Add more domains as needed
];
```

## Troubleshooting

### Lỗi CORS phổ biến

1. **"Access to fetch at '...' has been blocked by CORS policy"**

   - Kiểm tra domain có trong danh sách `origins`
   - Đảm bảo API route sử dụng `withCors` wrapper

2. **Preflight request failed**

   - Kiểm tra middleware có xử lý OPTIONS requests
   - Verify headers configuration

3. **Credentials not allowed**
   - Đảm bảo không sử dụng wildcard (`*`) với credentials trong production
   - Cấu hình specific origins

### Debug CORS

Thêm logging để debug:

```typescript
// Trong src/lib/cors.ts
console.log('CORS Origin:', origin);
console.log('Is Origin Allowed:', isOriginAllowed(origin));
console.log('CORS Headers:', corsHeaders);
```

## Security Notes

1. **Không sử dụng wildcard (`*`) trong production** với credentials
2. **Chỉ định cụ thể các domains** được phép
3. **Giới hạn methods và headers** cần thiết
4. **Sử dụng HTTPS** trong production

## Testing CORS

### Với curl

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:3000/api/manga

# Test actual request
curl -X GET \
  -H "Origin: https://yourdomain.com" \
  http://localhost:3000/api/manga
```

### Với JavaScript

```javascript
// Test từ browser console
fetch('http://localhost:3000/api/manga', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('CORS Error:', error));
```

## Migration Guide

### Cập nhật API routes hiện có

1. Import `withCors` từ `@/lib/cors`
2. Wrap handler functions với `withCors`
3. Thay đổi từ `function` sang `const` export

**Trước:**

```typescript
export async function GET(request: Request) {
  // logic
}
```

**Sau:**

```typescript
export const GET = withCors(async (request: NextRequest) => {
  // logic
});
```

### Kiểm tra sau khi migration

1. Test tất cả API endpoints
2. Verify preflight requests hoạt động
3. Check browser developer tools cho CORS errors
4. Test với different origins nếu có

## Environment Variables

```env
# Required for production CORS
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
VERCEL_URL=your-app.vercel.app

# Optional: Custom CORS origins (comma-separated)
CORS_ORIGINS=https://domain1.com,https://domain2.com

# Optional: Disable CORS in development
DISABLE_CORS=false
```

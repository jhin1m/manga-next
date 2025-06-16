# Manga Crawler

Hệ thống crawler đa nguồn cho dự án manga, hỗ trợ nhiều nguồn khác nhau và dễ dàng mở rộng.

## Cấu hình

### Biến môi trường

Thêm các biến môi trường sau vào file `.env`:

```
# MangaRaw API Token
MANGARAW_API_TOKEN=your_api_token_here
```

## Cách sử dụng

### Sử dụng từ code

```typescript
import { runCrawler } from '@/lib/crawler';

// Crawl từ MangaRaw với token từ biến môi trường
runCrawler({
  source: 'mangaraw',
  startPage: 1,
  endPage: 5,
  useOriginalImages: true,
});

// Crawl với token tùy chỉnh
runCrawler({
  source: 'mangaraw',
  startPage: 1,
  endPage: 5,
  authToken: 'your_custom_token_here',
});

// Crawl một manga cụ thể
runCrawler({
  source: 'mangaraw',
  mangaId: '20463a51-7faf-4a3f-9e67-5c624f80d487',
});
```

### Sử dụng qua API

```typescript
// POST /api/admin/crawler
const response = await fetch('/api/admin/crawler', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source: 'mangaraw',
    startPage: 1,
    endPage: 5,
    useOriginalImages: true,
    authToken: 'your_custom_token_here', // Tùy chọn, nếu không có sẽ dùng từ biến môi trường
  }),
});

// Lấy danh sách nguồn hỗ trợ
const sourcesResponse = await fetch('/api/admin/crawler', {
  method: 'GET',
});
const { sources } = await sourcesResponse.json();
```

### Sử dụng qua CLI

Crawler có thể được chạy trực tiếp từ terminal với cú pháp đơn giản:

```bash
# Cài đặt dependencies nếu chưa có
npm install dotenv

# Crawl từ trang 1 đến trang 5 của nguồn MangaRaw
npx ts-node scripts/crawl.ts mangaraw 1 5

# Sử dụng ảnh gốc thay vì tải về
npx ts-node scripts/crawl.ts mangaraw 1 5 --use-original-images

# Crawl một manga cụ thể theo ID
npx ts-node scripts/crawl.ts mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487

# Sử dụng token tùy chỉnh
npx ts-node scripts/crawl.ts mangaraw 1 5 --auth-token=your_token_here

# Hiển thị hướng dẫn sử dụng
npx ts-node scripts/crawl.ts --help
```

Các tùy chọn CLI:

```
Cách sử dụng:
  npx ts-node scripts/crawl.ts [source] [startPage] [endPage] [options]

Tham số:
  source                     Tên nguồn (mặc định: mangaraw)
  startPage                  Trang bắt đầu (mặc định: 1)
  endPage                    Trang kết thúc (tùy chọn)

Options:
  --manga-id=<id>            Crawl một manga cụ thể theo ID
  --use-original-images      Sử dụng URL ảnh gốc thay vì tải về
  --concurrency=<number>     Số lượng request đồng thời (mặc định: 3)
  --auth-token=<token>       Token xác thực (nếu không có sẽ dùng từ biến môi trường)
  -h, --help                 Hiển thị hướng dẫn này
```

## Tùy chọn

| Tùy chọn            | Kiểu dữ liệu | Mô tả                                                              |
| ------------------- | ------------ | ------------------------------------------------------------------ |
| `source`            | string       | Tên nguồn (mặc định: 'mangaraw')                                   |
| `startPage`         | number       | Trang bắt đầu (mặc định: 1)                                        |
| `endPage`           | number       | Trang kết thúc (tùy chọn)                                          |
| `mangaId`           | string       | ID của manga cụ thể (tùy chọn)                                     |
| `useOriginalImages` | boolean      | Sử dụng ảnh gốc thay vì tải về (mặc định: false)                   |
| `concurrency`       | number       | Số lượng request đồng thời (mặc định: 3)                           |
| `authToken`         | string       | Token xác thực (tùy chọn, nếu không có sẽ dùng từ biến môi trường) |

## Thêm nguồn mới

Để thêm một nguồn mới, bạn cần:

1. Tạo file mới trong thư mục `sources/` (ví dụ: `mangadex.ts`)
2. Implement interface `Source` hoặc kế thừa từ `BaseSource`
3. Đăng ký nguồn mới trong `factory.ts`

Ví dụ:

```typescript
// sources/mangadex.ts
import { BaseSource } from './base';
// ...

export class MangaDexSource extends BaseSource {
  constructor() {
    super({
      name: 'MangaDex',
      baseUrl: 'https://api.mangadex.org',
      perPage: 30,
      supportedFeatures: ['manga', 'chapter'],
      requiresAuth: true,
      authToken: process.env.MANGADEX_API_TOKEN || ''
    });
  }

  // Implement các phương thức cần thiết...
}

// Trong factory.ts
import { MangaDexSource } from './mangadex';
// ...

static initialize(): void {
  if (this.initialized) return;

  this.registerSource('mangaraw', new MangaRawSource());
  this.registerSource('mangadex', new MangaDexSource()); // Thêm nguồn mới

  this.initialized = true;
}
```

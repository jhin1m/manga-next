# ISR + On-Demand Revalidation Implementation Guide

## Tổng quan
Hướng dẫn này giúp implement Incremental Static Regeneration (ISR) và On-demand Revalidation cho manga website NextJS 15, giải quyết vấn đề dữ liệu không cập nhật tự động từ PostgreSQL.

## Vấn đề hiện tại
- Dữ liệu từ PostgreSQL không reflect ngay lập tức trên UI
- Cần rebuild toàn bộ app để thấy thay đổi
- Thiếu caching strategy trong `src/app/manga/page.tsx`

## Giải pháp: ISR + On-demand Revalidation

### 1. Tạo Centralized API Client

#### A. File: `src/lib/api/client.ts` (Tạo mới)
**Mục đích:** Centralize tất cả API calls và caching strategy

```typescript
// File này đã được tạo với:
// - Type-safe API endpoints
// - Consistent caching configuration
// - Specialized functions cho từng API type
// - Built-in error handling và logging
```

### 2. Cập nhật Fetch Patterns

#### A. File: `src/app/manga/page.tsx`
**Vị trí cần sửa:** Dòng 45-47 và import statements

```javascript
// BEFORE (hiện tại)
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?${queryParams.toString()}`
);

// AFTER (cần thay thế)
import { mangaApi } from '@/lib/api/client';

// Thay thế toàn bộ fetchManga function
async function fetchManga(params: {
  sort?: string;
  status?: string;
  genre?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const data = await mangaApi.getList(params);

    // Transform API data to match component needs
    return {
      data: data.comics.map((comic: any) => ({
        id: comic.id.toString(),
        title: comic.title,
        coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
        slug: comic.slug,
        latestChapter: comic.Chapters && comic.Chapters.length > 0
          ? `Chapter ${comic.Chapters[0].chapter_number}`
          : 'Updating',
        latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].slug
          : '',
        genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
        rating: 8.5,
        views: comic.total_views || 0,
        chapterCount: comic._chapterCount || 0,
        updatedAt: comic.last_chapter_uploaded_at ?
          formatDate(comic.last_chapter_uploaded_at) : 'Recently',
        status: comic.status || 'Ongoing',
      })),
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      totalResults: data.totalComics
    };
  } catch (error) {
    console.error('Error fetching manga list:', error);
    return { data: [], totalPages: 0, currentPage: 1, totalResults: 0 };
  }
}
```

#### B. Cập nhật các file khác (đã có ISR nhưng cần tags)

**File: `src/app/page.tsx` - Dòng 18-20:**
```javascript
// Thêm tags vào fetch hiện có
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?sort=${sortParam}&limit=${limit}&page=${page}`, {
  next: {
    revalidate: 3600,
    tags: ['manga-homepage', `manga-${sortParam}`]
  }
});
```

**File: `src/app/manga/[slug]/page.tsx` - Dòng 21-23:**
```javascript
// Thêm tags cho manga detail
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga/${slug}`, {
  next: {
    revalidate: 3600,
    tags: ['manga-detail', `manga-${slug}`]
  }
});
```

### 2. Tạo On-demand Revalidation API

#### File: `src/app/api/revalidate/route.ts` (Tạo mới)
```typescript
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tags, paths, secret } = body;

    // Verify secret token (optional security)
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate by tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag);
        console.log(`Revalidated tag: ${tag}`);
      }
    }

    // Revalidate by paths
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        console.log(`Revalidated path: ${path}`);
      }
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      tags: tags || [],
      paths: paths || []
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint để test
export async function GET() {
  return NextResponse.json({
    message: 'Revalidation API is working',
    usage: 'POST with { tags: [], paths: [], secret?: string }'
  });
}
```

### 3. Caching Strategy theo Content Type

#### Thời gian revalidate được khuyến nghị:
```javascript
// Manga list: 30 phút (cập nhật thường xuyên)
{ next: { revalidate: 1800, tags: ['manga-list'] } }

// Manga detail: 1 giờ (ít thay đổi)
{ next: { revalidate: 3600, tags: ['manga-detail'] } }

// Chapter content: 6 giờ (rất ít thay đổi)
{ next: { revalidate: 21600, tags: ['chapter-content'] } }

// Homepage: 1 giờ
{ next: { revalidate: 3600, tags: ['homepage'] } }

// Search results: 15 phút (dynamic content)
{ next: { revalidate: 900, tags: ['search-results'] } }
```

### 4. Database Integration

#### A. Tạo Revalidation Helper
**File: `src/lib/revalidation.ts` (Tạo mới)**
```typescript
export async function triggerRevalidation(options: {
  tags?: string[];
  paths?: string[];
  mangaSlug?: string;
  chapterId?: string;
}) {
  const { tags = [], paths = [], mangaSlug, chapterId } = options;

  // Auto-generate tags based on context
  const allTags = [...tags];
  const allPaths = [...paths];

  if (mangaSlug) {
    allTags.push(`manga-${mangaSlug}`, 'manga-list', 'manga-detail');
    allPaths.push(`/manga/${mangaSlug}`);
  }

  if (chapterId) {
    allTags.push(`chapter-${chapterId}`, 'chapter-content');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tags: allTags,
        paths: allPaths,
        secret: process.env.REVALIDATION_SECRET
      })
    });

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Revalidation successful:', result);
    return result;

  } catch (error) {
    console.error('Revalidation error:', error);
    throw error;
  }
}
```

#### B. Integration với API Routes
**Cập nhật `src/app/api/manga/route.ts`:**
```typescript
// Thêm vào cuối POST/PUT handlers
import { triggerRevalidation } from '@/lib/revalidation';

// Sau khi create/update manga
await triggerRevalidation({
  tags: ['manga-list', 'manga-latest'],
  paths: ['/manga', '/']
});
```

### 5. Environment Variables

#### Thêm vào `.env.local`:
```env
# Optional: Secret for revalidation API security
REVALIDATION_SECRET=your-secret-key-here

# Ensure API URL is set
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 6. Testing Revalidation

#### A. Manual Testing
```bash
# Test revalidation API
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tags": ["manga-list"], "secret": "your-secret-key"}'
```

#### B. Database Update Testing
```javascript
// Sau khi update database via TablePlus hoặc admin panel
await fetch('/api/revalidate', {
  method: 'POST',
  body: JSON.stringify({
    tags: ['manga-list', 'manga-latest'],
    paths: ['/manga']
  })
});
```

### 7. Monitoring & Debugging

#### A. Logging
```javascript
// Thêm vào fetch functions
console.log(`Fetching with cache tags: ${JSON.stringify(tags)}`);
console.log(`Cache revalidate time: ${revalidateTime}s`);
```

#### B. Cache Headers Check
```javascript
// Kiểm tra cache status trong browser DevTools
// Look for: x-nextjs-cache: HIT/MISS/STALE
```

## Implementation Checklist

- [x] Cập nhật `src/app/manga/page.tsx` với ISR tags
- [x] Tạo `/api/revalidate` endpoint
- [x] Tạo `src/lib/revalidation.ts` helper
- [x] Cập nhật các fetch functions khác với tags
- [x] Thêm environment variables
- [x] Test revalidation manually (script available)
- [ ] Integrate với database update workflows
- [ ] Monitor cache performance

## ✅ IMPLEMENTATION COMPLETED

The on-demand revalidation system has been successfully implemented with the following components:

### 📁 Files Created/Updated:
- `src/app/api/revalidate/route.ts` - Main revalidation API endpoint
- `src/lib/revalidation.ts` - Helper utilities for easy integration
- `src/lib/api/client.ts` - Updated with revalidation API functions
- `scripts/test-revalidation.js` - Comprehensive test script
- `docs/revalidation-integration-examples.md` - Integration examples
- `.env.example` - Added REVALIDATION_SECRET configuration

### 🚀 Ready to Use:
```bash
# Test the implementation
pnpm test:revalidation

# Manual revalidation examples
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"mangaSlug": "one-piece"}'
```

## Lợi ích sau khi implement

1. **Tự động cập nhật:** Dữ liệu mới từ PostgreSQL reflect ngay lập tức
2. **Performance:** Giữ được tốc độ static site với dynamic content
3. **Scalability:** Không cần rebuild toàn bộ app
4. **Flexibility:** Control được caching strategy cho từng content type
5. **User Experience:** Luôn có dữ liệu fresh mà không ảnh hưởng loading time

## Troubleshooting

### Vấn đề thường gặp:
1. **Tags không work:** Kiểm tra spelling và case-sensitive
2. **Revalidation không trigger:** Verify API endpoint và secret key
3. **Cache quá aggressive:** Giảm revalidate time
4. **Performance issues:** Tăng revalidate time cho content ít thay đổi

### Debug commands:
```bash
# Check Next.js cache
ls -la .next/cache

# Monitor revalidation logs
tail -f .next/trace
```

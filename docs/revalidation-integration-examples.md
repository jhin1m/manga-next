# Revalidation Integration Examples

This document provides examples of how to integrate on-demand revalidation into your existing API routes to automatically update cache when data changes.

## Basic Integration Pattern

### 1. Import Revalidation Helper

```typescript
import { revalidateManga, revalidateChapter, revalidateMangaList } from '@/lib/revalidation';
```

### 2. Call After Database Operations

```typescript
// After successful database operation
await revalidateManga(mangaSlug);
```

## API Route Examples

### Manga API Routes

#### `src/app/api/manga/route.ts` - Create/Update Manga

```typescript
import { revalidateManga, revalidateMangaList } from '@/lib/revalidation';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Create manga in database
    const manga = await prisma.comic.create({
      data: {
        title: data.title,
        slug: data.slug,
        // ... other fields
      },
    });

    // Trigger revalidation after successful creation
    await revalidateManga(manga.slug);

    return NextResponse.json({ success: true, manga });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create manga' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    // Update manga in database
    const manga = await prisma.comic.update({
      where: { id: data.id },
      data: {
        title: data.title,
        // ... other fields
      },
    });

    // Trigger revalidation after successful update
    await revalidateManga(manga.slug);

    return NextResponse.json({ success: true, manga });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update manga' }, { status: 500 });
  }
}
```

#### `src/app/api/manga/[slug]/chapters/route.ts` - Add Chapter

```typescript
import { revalidateChapter } from '@/lib/revalidation';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const data = await request.json();
    const mangaSlug = params.slug;

    // Create chapter in database
    const chapter = await prisma.chapter.create({
      data: {
        title: data.title,
        chapter_number: data.chapter_number,
        comic: { connect: { slug: mangaSlug } },
        // ... other fields
      },
    });

    // Trigger revalidation after successful chapter creation
    await revalidateChapter(mangaSlug, chapter.id.toString());

    return NextResponse.json({ success: true, chapter });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
```

### Admin/Crawler API Routes

#### `src/app/api/admin/crawler/route.ts` - Bulk Updates

```typescript
import { onBulkUpdate } from '@/lib/revalidation';

export async function POST(request: Request) {
  try {
    // Perform bulk manga updates
    const results = await performBulkMangaUpdate();

    // Trigger bulk revalidation
    await onBulkUpdate('manga');

    return NextResponse.json({
      success: true,
      message: 'Bulk update completed',
      updated: results.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Bulk update failed' }, { status: 500 });
  }
}
```

## Database Trigger Integration

### Prisma Middleware Example

```typescript
// src/lib/prisma-middleware.ts
import { PrismaClient } from '@prisma/client';
import { revalidateManga, revalidateChapter } from '@/lib/revalidation';

const prisma = new PrismaClient();

// Middleware to trigger revalidation on data changes
prisma.$use(async (params, next) => {
  const result = await next(params);

  // Trigger revalidation based on model and action
  if (params.action === 'create' || params.action === 'update') {
    switch (params.model) {
      case 'Comic':
        if (result.slug) {
          await revalidateManga(result.slug);
        }
        break;

      case 'Chapter':
        if (result.comic_id) {
          // Get manga slug from comic_id
          const comic = await prisma.comic.findUnique({
            where: { id: result.comic_id },
            select: { slug: true },
          });
          if (comic) {
            await revalidateChapter(comic.slug, result.id.toString());
          }
        }
        break;
    }
  }

  return result;
});

export default prisma;
```

## Manual Revalidation Examples

### Admin Dashboard Integration

```typescript
// src/app/admin/revalidation/page.tsx
'use client';

import { useState } from 'react';
import { revalidationApi } from '@/lib/api/client';

export default function RevalidationPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRevalidate = async (type: string) => {
    setLoading(true);
    try {
      let response;

      switch (type) {
        case 'manga-list':
          response = await revalidationApi.trigger({
            tags: ['manga-list', 'manga-latest'],
            paths: ['/manga', '/']
          });
          break;

        case 'all':
          response = await revalidationApi.all();
          break;

        default:
          response = await revalidationApi.health();
      }

      setResult(response);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2>Cache Revalidation Panel</h2>

      <div className="flex gap-2">
        <button
          onClick={() => handleRevalidate('manga-list')}
          disabled={loading}
        >
          Revalidate Manga List
        </button>

        <button
          onClick={() => handleRevalidate('all')}
          disabled={loading}
        >
          Revalidate All
        </button>
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

### Webhook Integration

```typescript
// src/app/api/webhooks/database/route.ts
import { triggerRevalidation } from '@/lib/revalidation';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { table, action, record } = payload;

    // Handle different database events
    switch (table) {
      case 'comics':
        if (record.slug) {
          await triggerRevalidation({ mangaSlug: record.slug });
        }
        break;

      case 'chapters':
        if (record.comic_slug) {
          await triggerRevalidation({
            mangaSlug: record.comic_slug,
            chapterId: record.id.toString(),
          });
        }
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

## Testing Revalidation

### Manual Testing

```bash
# Test revalidation API health
curl http://localhost:3000/api/revalidate

# Test manga revalidation
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"mangaSlug": "one-piece"}'

# Test with secret
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tags": ["manga-list"], "secret": "your-secret-key"}'
```

### Automated Testing

```typescript
// src/tests/revalidation.test.ts
import { checkRevalidationHealth, revalidateManga } from '@/lib/revalidation';

describe('Revalidation', () => {
  test('health check should pass', async () => {
    const isHealthy = await checkRevalidationHealth();
    expect(isHealthy).toBe(true);
  });

  test('manga revalidation should work', async () => {
    const result = await revalidateManga('test-manga');
    expect(result.success).toBe(true);
  });
});
```

## Best Practices

1. **Always revalidate after successful database operations**
2. **Use specific tags rather than revalidating everything**
3. **Handle revalidation errors gracefully (don't fail the main operation)**
4. **Use bulk revalidation for bulk operations**
5. **Monitor revalidation performance and frequency**
6. **Use secret key in production for security**

## Common Patterns

### Error Handling

```typescript
try {
  // Database operation
  const manga = await createManga(data);

  // Revalidation (don't fail if this fails)
  try {
    await revalidateManga(manga.slug);
  } catch (revalidationError) {
    console.warn('Revalidation failed:', revalidationError);
    // Continue - don't fail the main operation
  }

  return { success: true, manga };
} catch (error) {
  return { error: 'Failed to create manga' };
}
```

### Background Revalidation

```typescript
// Fire and forget revalidation
createManga(data).then(manga => {
  revalidateManga(manga.slug).catch(console.warn);
});
```

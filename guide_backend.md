# Backend Development Guide

This guide provides detailed instructions for implementing the backend API routes for the manga website using Next.js, PostgreSQL, and Prisma ORM.

## 1. Database Setup and Configuration

### 1.1. Set up PostgreSQL Database

```bash
# Create a new PostgreSQL database
createdb manga-next

# Import the schema from comic_site_schema.sql
psql manga-next < comic_site_schema.sql
```

### 1.2. Configure Prisma ORM

```bash
# Install Prisma dependencies
npm install prisma --save-dev
npm install @prisma/client

# Initialize Prisma in the project
npx prisma init
```

Edit the `.env` file to configure the database connection:

```
DATABASE_URL="postgresql://postgres:@localhost:5432/manga-next?schema=public"
```

Generate Prisma schema from the existing database:

```bash
npx prisma db pull
```

Generate Prisma client:

```bash
npx prisma generate
```

### 1.3. Create Database Client Utility

Create a reusable Prisma client instance in `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

## 2. API Routes Implementation

### 2.1. Manga API Routes

#### 2.1.1. `/api/manga` - Get manga list with filtering and pagination

Create `src/app/api/manga/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const genre = searchParams.get('genre')
    const sort = searchParams.get('sort') || 'latest'

    // Build the query
    const where = {
      ...(status ? { status } : {}),
      ...(genre ? {
        Comic_Genres: {
          some: {
            genre: {
              slug: genre
            }
          }
        }
      } : {})
    }

    // Determine sort order
    const orderBy = sort === 'latest' 
      ? { last_chapter_uploaded_at: 'desc' as const } 
      : sort === 'popular' 
        ? { total_views: 'desc' as const } 
        : { title: 'asc' as const }

    // Execute query
    const [comics, totalComics] = await Promise.all([
      prisma.comics.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          Comic_Genres: {
            include: {
              genre: true
            }
          }
        }
      }),
      prisma.comics.count({ where })
    ])

    return NextResponse.json({ 
      comics, 
      totalPages: Math.ceil(totalComics / limit),
      currentPage: page,
      totalComics
    })
  } catch (error) {
    console.error("[API_MANGA_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

#### 2.1.2. `/api/manga/[slug]` - Get manga details

Create `src/app/api/manga/[slug]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    const manga = await prisma.comics.findUnique({
      where: { slug },
      include: {
        Comic_Genres: {
          include: {
            genre: true
          }
        },
        Comic_Authors: {
          include: {
            author: true
          }
        },
        Comic_Publishers: {
          include: {
            publisher: true
          }
        }
      }
    })

    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ manga })
  } catch (error) {
    console.error("[API_MANGA_SLUG_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

#### 2.1.3. `/api/manga/[slug]/chapters` - Get chapter list for a manga

Create `src/app/api/manga/[slug]/chapters/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const slug = params.slug

    // Get the manga ID first
    const manga = await prisma.comics.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      )
    }

    // Get chapters with pagination
    const [chapters, totalChapters] = await Promise.all([
      prisma.chapters.findMany({
        where: { comic_id: manga.id },
        orderBy: { chapter_number: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.chapters.count({
        where: { comic_id: manga.id }
      })
    ])

    return NextResponse.json({
      chapters,
      totalPages: Math.ceil(totalChapters / limit),
      currentPage: page,
      totalChapters
    })
  } catch (error) {
    console.error("[API_MANGA_CHAPTERS_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 2.2. Chapter API Routes

#### 2.2.1. `/api/chapters/[id]` - Get chapter content

Create `src/app/api/chapters/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Get chapter with pages
    const chapter = await prisma.chapters.findUnique({
      where: { id },
      include: {
        Pages: {
          orderBy: { page_number: 'asc' }
        },
        comic: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Get previous and next chapters
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapters.findFirst({
        where: {
          comic_id: chapter.comic_id,
          chapter_number: {
            lt: chapter.chapter_number
          }
        },
        orderBy: { chapter_number: 'desc' },
        select: { id: true, chapter_number: true }
      }),
      prisma.chapters.findFirst({
        where: {
          comic_id: chapter.comic_id,
          chapter_number: {
            gt: chapter.chapter_number
          }
        },
        orderBy: { chapter_number: 'asc' },
        select: { id: true, chapter_number: true }
      })
    ])

    // Increment view count
    await prisma.chapters.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    })

    return NextResponse.json({
      chapter,
      prevChapter,
      nextChapter
    })
  } catch (error) {
    console.error("[API_CHAPTER_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 2.3. Search API Route

Create `src/app/api/search/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const genre = searchParams.get('genre')
    const status = searchParams.get('status')

    if (!query) {
      return NextResponse.json({ comics: [], totalPages: 0, currentPage: 1, totalComics: 0 })
    }

    // Build the search query
    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } }
      ],
      ...(status ? { status } : {}),
      ...(genre ? {
        Comic_Genres: {
          some: {
            genre: {
              slug: genre
            }
          }
        }
      } : {})
    }

    // Execute query
    const [comics, totalComics] = await Promise.all([
      prisma.comics.findMany({
        where,
        orderBy: { title: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          Comic_Genres: {
            include: {
              genre: true
            }
          }
        }
      }),
      prisma.comics.count({ where })
    ])

    return NextResponse.json({
      comics,
      totalPages: Math.ceil(totalComics / limit),
      currentPage: page,
      totalComics
    })
  } catch (error) {
    console.error("[API_SEARCH_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

## 3. Testing and Documentation

### 3.1. Testing API Endpoints

You can test your API endpoints using tools like Postman or by creating a simple test script:

```typescript
// tests/api/manga.test.ts
async function testMangaAPI() {
  const response = await fetch('http://localhost:3000/api/manga?page=1&limit=10')
  const data = await response.json()
  console.log('Manga API Response:', data)
}

testMangaAPI()
```

### 3.2. API Documentation

Create a simple API documentation in your project README or a separate markdown file:

```markdown
# API Documentation

## Manga Endpoints

### GET /api/manga
Get a paginated list of manga with optional filtering.

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- status: Filter by status (optional)
- genre: Filter by genre slug (optional)
- sort: Sort order ('latest', 'popular', 'alphabetical') (default: 'latest')

**Response:**
```json
{
  "comics": [...],
  "totalPages": 10,
  "currentPage": 1,
  "totalComics": 200
}
```

### GET /api/manga/[slug]
Get detailed information about a specific manga.

...
```

## 4. Performance Optimization

### 4.1. Database Query Optimization

- Use appropriate indexes for frequently queried fields
- Limit the fields returned in queries using `select`
- Use pagination to limit the number of records returned

### 4.2. API Response Optimization

- Implement response compression
- Use appropriate HTTP caching headers
- Consider implementing rate limiting for public APIs

## 5. Next Steps

After implementing the core API routes, consider adding:

- User authentication and authorization
- Favorites and reading progress tracking
- Comments and ratings
- Admin panel for content management

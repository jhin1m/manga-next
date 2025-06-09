import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withCors } from '@/lib/cors'

export const GET = withCors(async (request: NextRequest) => {
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
            Genres: {
              slug: genre
            }
          }
        }
      } : {})
    }

    // Determine sort order
    const orderBy = sort === 'latest'
      ? [
          { last_chapter_uploaded_at: 'desc' as const },
          { created_at: 'desc' as const } // fallback for null values
        ]
      : sort === 'popular'
        ? { total_views: 'desc' as const }
        : { title: 'asc' as const }

    // ✅ OPTIMIZED: Use database-level sorting and pagination
    const skip = (page - 1) * limit;

    // Build optimized orderBy for database-level sorting
    let dbOrderBy;
    if (sort === 'latest') {
      // Use COALESCE-like behavior: sort by last_chapter_uploaded_at DESC NULLS LAST, then created_at DESC
      dbOrderBy = [
        { last_chapter_uploaded_at: { sort: 'desc', nulls: 'last' } },
        { created_at: 'desc' }
      ];
    } else if (sort === 'popular') {
      dbOrderBy = { total_views: 'desc' };
    } else {
      dbOrderBy = { title: 'asc' };
    }

    // ✅ OPTIMIZED: Single query with aggregation to get chapter counts
    const [comics, totalComics] = await Promise.all([
      prisma.comics.findMany({
        where,
        orderBy: dbOrderBy,
        skip,
        take: limit,
        include: {
          Comic_Genres: {
            include: {
              Genres: true
            }
          },
          Chapters: {
            orderBy: {
              chapter_number: 'desc'
            },
            take: 1,
            select: {
              id: true,
              chapter_number: true,
              title: true,
              slug: true,
              release_date: true
            }
          },
          // ✅ Include chapter count in single query
          _count: {
            select: {
              Chapters: true
            }
          }
        }
      }),
      prisma.comics.count({ where })
    ]);

    // ✅ Transform data without additional queries
    const comicsWithChapterCounts = comics.map(comic => ({
      ...comic,
      _chapterCount: comic._count.Chapters
    }));

    return NextResponse.json({
      comics: comicsWithChapterCounts,
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
})

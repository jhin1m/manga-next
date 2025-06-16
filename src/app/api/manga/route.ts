import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCors } from '@/lib/cors';

export const GET = withCors(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');
    const sort = searchParams.get('sort') || 'latest';

    // Build the query
    const where = {
      ...(status ? { status } : {}),
      ...(genre
        ? {
            Comic_Genres: {
              some: {
                Genres: {
                  slug: genre,
                },
              },
            },
          }
        : {}),
    };

    // Determine sort order
    const orderBy =
      sort === 'latest'
        ? [
            { last_chapter_uploaded_at: 'desc' as const },
            { created_at: 'desc' as const }, // fallback for null values
          ]
        : sort === 'popular'
          ? { total_views: 'desc' as const }
          : { title: 'asc' as const };

    // Optimized query execution - Use database-level sorting for better performance
    let comics, totalComics;

    if (sort === 'latest') {
      // OPTIMIZED: Use database-level sorting with proper null handling
      // This avoids loading all records into memory for sorting
      const [paginatedComics, total] = await Promise.all([
        prisma.comics.findMany({
          where,
          // Use database-level sorting with NULLS LAST equivalent
          orderBy: [
            { last_chapter_uploaded_at: { sort: 'desc', nulls: 'last' } },
            { created_at: 'desc' },
          ],
          skip: (page - 1) * limit,
          take: limit,
          include: {
            Comic_Genres: {
              include: {
                Genres: true,
              },
            },
            Chapters: {
              orderBy: {
                chapter_number: 'desc',
              },
              take: 1,
              select: {
                id: true,
                chapter_number: true,
                title: true,
                slug: true,
                release_date: true,
              },
            },
            _count: {
              select: {
                Chapters: true,
              },
            },
          },
        }),
        prisma.comics.count({ where }),
      ]);

      comics = paginatedComics;
      totalComics = total;
    } else {
      // For other sorts (popular, alphabetical), use database-level pagination
      const [paginatedComics, total] = await Promise.all([
        prisma.comics.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            Comic_Genres: {
              include: {
                Genres: true,
              },
            },
            Chapters: {
              orderBy: {
                chapter_number: 'desc',
              },
              take: 1,
              select: {
                id: true,
                chapter_number: true,
                title: true,
                slug: true,
                release_date: true,
              },
            },
            _count: {
              select: {
                Chapters: true,
              },
            },
          },
        }),
        prisma.comics.count({ where }),
      ]);

      comics = paginatedComics;
      totalComics = total;
    }

    // Transform comics data with chapter counts (no additional queries needed)
    const comicsWithChapterCounts = comics.map(comic => ({
      ...comic,
      _chapterCount: comic._count.Chapters,
    }));

    return NextResponse.json({
      comics: comicsWithChapterCounts,
      totalPages: Math.ceil(totalComics / limit),
      currentPage: page,
      totalComics,
    });
  } catch (error) {
    console.error('[API_MANGA_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

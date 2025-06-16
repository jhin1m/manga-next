import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withCors } from '@/lib/cors';

// Type for the raw query result (excluding search_vector)
interface ComicSearchResult {
  id: number;
  title: string;
  slug: string;
  alternative_titles: any;
  description: string | null;
  cover_image_url: string | null;
  status: string;
  release_date: Date | null;
  country_of_origin: string | null;
  age_rating: string | null;
  total_views: number | null;
  total_favorites: number | null;
  last_chapter_uploaded_at: Date | null;
  uploader_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  rank: number;
}

export const GET = withCors(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const status = searchParams.get('status');

    if (!query) {
      return NextResponse.json({ comics: [], totalPages: 0, currentPage: 1, totalComics: 0 });
    }

    // Format query for full text search
    const formattedQuery = query
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => `${word}:*`)
      .join(' & ');

    // Use raw query for full text search with ranking
    const skip = (page - 1) * limit;

    // Build dynamic WHERE conditions
    let whereConditions = `c.search_vector @@ to_tsquery('english', $1)`;
    const queryParams: any[] = [formattedQuery];
    let paramIndex = 2;

    if (status) {
      whereConditions += ` AND c.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (genre) {
      whereConditions += ` AND EXISTS (
        SELECT 1 FROM "Comic_Genres" cg
        JOIN "Genres" g ON cg.genre_id = g.id
        WHERE cg.comic_id = c.id AND g.slug = $${paramIndex}
      )`;
      queryParams.push(genre);
      paramIndex++;
    }

    // Build the complete SQL query
    const searchQuery = `
      SELECT c.id, c.title, c.slug, c.alternative_titles, c.description,
        c.cover_image_url, c.status, c.release_date, c.country_of_origin,
        c.age_rating, c.total_views, c.total_favorites, c.last_chapter_uploaded_at,
        c.uploader_id, c.created_at, c.updated_at,
        ts_rank(c.search_vector, to_tsquery('english', $1))::float as rank
      FROM "Comics" c
      WHERE ${whereConditions}
      ORDER BY rank DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Comics" c
      WHERE ${whereConditions}
    `;

    // Execute raw query for search with ranking
    // Exclude search_vector column to avoid Prisma deserialization error
    const comicsResult = await prisma.$queryRawUnsafe<ComicSearchResult[]>(
      searchQuery,
      ...queryParams,
      limit,
      skip
    );

    // Count total results
    const totalResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      countQuery,
      ...queryParams
    );

    const totalComics = Number(totalResult[0].count);

    // Get comic IDs from the search results
    const comicIds: number[] = comicsResult.map((comic: ComicSearchResult) => comic.id);

    // Fetch related data for comics
    const comicsWithRelations = await prisma.comics.findMany({
      where: {
        id: { in: comicIds },
      },
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
      },
    });

    // Sort the results to match the original ranking
    const comicsInOrder = comicIds
      .map((id: number) => comicsWithRelations.find((comic: any) => comic.id === id))
      .filter(Boolean);

    // Add rank information to the results
    const comicsWithRank = comicsInOrder.map((comic: any, index: number) => ({
      ...comic,
      rank: comicsResult[index].rank,
    }));

    // Get chapter counts for each manga
    const comicsWithChapterCounts = await Promise.all(
      comicsWithRank.map(async (comic: any) => {
        const chapterCount = await prisma.chapters.count({
          where: { comic_id: comic.id },
        });
        return {
          ...comic,
          _chapterCount: chapterCount,
        };
      })
    );

    return NextResponse.json({
      comics: comicsWithChapterCounts,
      totalPages: Math.ceil(totalComics / limit),
      currentPage: page,
      totalComics,
    });
  } catch (error) {
    console.error('[API_SEARCH_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

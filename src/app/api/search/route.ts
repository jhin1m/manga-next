import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

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

    // Format query for full text search
    const formattedQuery = query
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => `${word}:*`)
      .join(' & ')

    // Build genre and status conditions
    const genreCondition = genre ? Prisma.sql`
      AND EXISTS (
        SELECT 1 FROM "Comic_Genres" cg
        JOIN "Genres" g ON cg.genre_id = g.id
        WHERE cg.comic_id = c.id AND g.slug = ${genre}
      )
    ` : Prisma.sql``

    const statusCondition = status ? Prisma.sql`AND c.status = ${status}` : Prisma.sql``
    
    // Use raw query for full text search with ranking
    const skip = (page - 1) * limit

    // Execute raw query for search with ranking
    const comicsResult = await prisma.$queryRaw<any[]>`
      SELECT c.*, 
        ts_rank(c.search_vector, to_tsquery('english', ${formattedQuery})) as rank
      FROM "Comics" c
      WHERE c.search_vector @@ to_tsquery('english', ${formattedQuery})
      ${statusCondition}
      ${genreCondition}
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Count total results
    const totalResult = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count
      FROM "Comics" c
      WHERE c.search_vector @@ to_tsquery('english', ${formattedQuery})
      ${statusCondition}
      ${genreCondition}
    `;
    
    const totalComics = Number(totalResult[0].count);

    // Get comic IDs from the search results
    const comicIds = comicsResult.map(comic => comic.id);

    // Fetch related data for comics
    const comicsWithRelations = await prisma.comics.findMany({
      where: {
        id: { in: comicIds }
      },
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
        }
      }
    });

    // Sort the results to match the original ranking
    const comicsInOrder = comicIds.map(id => 
      comicsWithRelations.find(comic => comic.id === id)
    ).filter(Boolean);

    // Add rank information to the results
    const comicsWithRank = comicsInOrder.map((comic, index) => ({
      ...comic,
      rank: comicsResult[index].rank
    }))

    // Get chapter counts for each manga
    const comicsWithChapterCounts = await Promise.all(
      comicsWithRank.map(async (comic) => {
        const chapterCount = await prisma.chapters.count({
          where: { comic_id: comic.id }
        });
        return {
          ...comic,
          _chapterCount: chapterCount
        };
      })
    );

    return NextResponse.json({
      comics: comicsWithChapterCounts,
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

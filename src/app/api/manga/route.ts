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
            Genres: {
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
      }),
      prisma.comics.count({ where })
    ])

    // Get chapter counts for each manga
    const comicsWithChapterCounts = await Promise.all(
      comics.map(async (comic) => {
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
    console.error("[API_MANGA_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

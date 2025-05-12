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
            Genres: {
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
    console.error("[API_SEARCH_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

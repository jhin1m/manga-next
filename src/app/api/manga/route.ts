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

    // Execute query - we'll handle null sorting in post-processing for latest
    const [allComics, totalComics] = await Promise.all([
      prisma.comics.findMany({
        where,
        orderBy: sort === 'latest' ? { created_at: 'desc' } : orderBy, // temporary sort for latest
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

    // For latest sort, manually sort to put null last_chapter_uploaded_at at the end
    let comics
    if (sort === 'latest') {
      const sortedComics = allComics.sort((a, b) => {
        // If both have dates, sort by date desc
        if (a.last_chapter_uploaded_at && b.last_chapter_uploaded_at) {
          return new Date(b.last_chapter_uploaded_at).getTime() - new Date(a.last_chapter_uploaded_at).getTime()
        }
        // If only a has date, a comes first
        if (a.last_chapter_uploaded_at && !b.last_chapter_uploaded_at) {
          return -1
        }
        // If only b has date, b comes first
        if (!a.last_chapter_uploaded_at && b.last_chapter_uploaded_at) {
          return 1
        }
        // If both are null, sort by created_at desc (both should have created_at)
        const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0
        const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0
        return bCreatedAt - aCreatedAt
      })

      // Apply pagination after sorting
      comics = sortedComics.slice((page - 1) * limit, page * limit)
    } else {
      // Apply pagination for other sorts
      comics = allComics.slice((page - 1) * limit, page * limit)
    }

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
})

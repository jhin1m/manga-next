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

    // Optimized query execution based on sort type
    let comics, totalComics

    if (sort === 'latest') {
      // For latest sort, we need custom handling for null last_chapter_uploaded_at
      // First get all comics to sort properly, then paginate
      const [allComics, total] = await Promise.all([
        prisma.comics.findMany({
          where,
          orderBy: { created_at: 'desc' }, // temporary sort
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
            _count: {
              select: {
                Chapters: true
              }
            }
          }
        }),
        prisma.comics.count({ where })
      ])

      // Sort to put null last_chapter_uploaded_at at the end
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
        // If both are null, sort by created_at desc
        const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0
        const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0
        return bCreatedAt - aCreatedAt
      })

      // Apply pagination after sorting
      comics = sortedComics.slice((page - 1) * limit, page * limit)
      totalComics = total
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
            _count: {
              select: {
                Chapters: true
              }
            }
          }
        }),
        prisma.comics.count({ where })
      ])

      comics = paginatedComics
      totalComics = total
    }

    // Transform comics data with chapter counts (no additional queries needed)
    const comicsWithChapterCounts = comics.map((comic) => ({
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

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth, extractPaginationParams, buildPaginationResponse, logAdminAction } from '@/lib/admin/middleware'
import { AdminRole, mangaCreateSchema } from '@/types/admin'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/manga
 * Get manga list with admin details and filters
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.EDITOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { page, limit, sort, order, search, status } = extractPaginationParams(request.url)

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    // Build order by clause
    const orderBy: any = {}
    if (sort === 'title') {
      orderBy.title = order
    } else if (sort === 'status') {
      orderBy.status = order
    } else if (sort === 'views') {
      orderBy.view_count = order
    } else {
      orderBy.created_at = order
    }

    // Get manga with pagination
    const [manga, totalCount] = await Promise.all([
      prisma.comics.findMany({
        where,
        include: {
          Comic_Authors: {
            include: {
              Authors: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          Comic_Genres: {
            include: {
              Genres: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: {
            select: {
              Chapters: true,
              Comic_Views: true,
              Favorites: true,
              Ratings: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.comics.count({ where })
    ])

    // Transform data to include statistics
    const transformedManga = manga.map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      cover_url: item.cover_image_url,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      published_at: item.release_date,
      Authors: item.Comic_Authors.map(ca => ca.Authors),
      Genres: item.Comic_Genres.map(cg => cg.Genres),
      stats: {
        chaptersCount: item._count.Chapters,
        viewsCount: item._count.Comic_Views,
        favoritesCount: item._count.Favorites,
        ratingsCount: item._count.Ratings,
        averageRating: 0 // TODO: Calculate from ratings
      }
    }))

    return NextResponse.json({
      success: true,
      ...buildPaginationResponse(transformedManga, totalCount, page, limit)
    })

  } catch (error) {
    console.error('[ADMIN_MANGA_LIST_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch manga list' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/manga
 * Create new manga
 */
export async function POST(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.EDITOR)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult
    const body = await request.json()
    const validatedData = mangaCreateSchema.parse(body)

    // Check if slug already exists
    const existingManga = await prisma.comics.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingManga) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Manga with this slug already exists' 
        },
        { status: 409 }
      )
    }

    // Create manga
    const manga = await prisma.comics.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        cover_image_url: validatedData.cover_url,
        status: validatedData.status || 'ongoing',
        uploader_id: validatedData.author_id,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        Comic_Authors: {
          include: {
            Authors: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })

    // Add genres if provided
    if (validatedData.genre_ids && validatedData.genre_ids.length > 0) {
      await prisma.comic_Genres.createMany({
        data: validatedData.genre_ids.map(genreId => ({
          comic_id: manga.id,
          genre_id: genreId
        }))
      })
    }

    // Log admin action
    await logAdminAction(
      parseInt(user.id),
      'CREATE_MANGA',
      'manga',
      manga.id,
      { title: manga.title, slug: manga.slug },
      request
    )

    return NextResponse.json({
      success: true,
      message: 'Manga created successfully',
      data: manga
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('[ADMIN_MANGA_CREATE_ERROR]', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create manga' 
      },
      { status: 500 }
    )
  }
}

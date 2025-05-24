import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Validation schema for adding/removing favorites
const favoriteToggleSchema = z.object({
  comicId: z.number().int().positive(),
})

/**
 * GET /api/favorites
 * Get all favorites for the current user
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get user favorites with pagination
    const favorites = await prisma.favorites.findMany({
      where: {
        user_id: parseInt(session.user.id),
      },
      include: {
        Comics: {
          select: {
            id: true,
            title: true,
            slug: true,
            cover_image_url: true,
            status: true,
            total_views: true,
            total_favorites: true,
            Comic_Genres: {
              include: {
                Genres: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
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
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const totalFavorites = await prisma.favorites.count({
      where: {
        user_id: parseInt(session.user.id),
      },
    })

    // Format the response
    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.Comics.id,
      title: favorite.Comics.title,
      slug: favorite.Comics.slug,
      coverImage: favorite.Comics.cover_image_url,
      status: favorite.Comics.status,
      views: favorite.Comics.total_views,
      favorites: favorite.Comics.total_favorites,
      genres: favorite.Comics.Comic_Genres.map((genre) => ({
        name: genre.Genres.name,
        slug: genre.Genres.slug,
      })),
      latestChapter: favorite.Comics.Chapters[0]
        ? {
            id: favorite.Comics.Chapters[0].id,
            number: favorite.Comics.Chapters[0].chapter_number,
            title: favorite.Comics.Chapters[0].title,
            slug: favorite.Comics.Chapters[0].slug,
            releaseDate: favorite.Comics.Chapters[0].release_date,
          }
        : null,
      addedAt: favorite.created_at,
    }))

    return NextResponse.json({
      favorites: formattedFavorites,
      pagination: {
        total: totalFavorites,
        currentPage: page,
        totalPages: Math.ceil(totalFavorites / limit),
        perPage: limit,
      },
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Toggle favorite status for a manga
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = favoriteToggleSchema.parse(body)
    const userId = parseInt(session.user.id)
    const comicId = validatedData.comicId

    // Check if the manga exists
    const manga = await prisma.comics.findUnique({
      where: { id: comicId },
      select: { id: true },
    })

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 })
    }

    // Check if the favorite already exists
    const existingFavorite = await prisma.favorites.findUnique({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: comicId,
        },
      },
    })

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      if (existingFavorite) {
        // Remove from favorites
        await tx.favorites.delete({
          where: {
            user_id_comic_id: {
              user_id: userId,
              comic_id: comicId,
            },
          },
        })

        // Decrement total_favorites count
        await tx.comics.update({
          where: { id: comicId },
          data: {
            total_favorites: {
              decrement: 1,
            },
          },
        })

        return { action: 'removed', isFavorite: false }
      } else {
        // Add to favorites
        await tx.favorites.create({
          data: {
            user_id: userId,
            comic_id: comicId,
          },
        })

        // Increment total_favorites count
        await tx.comics.update({
          where: { id: comicId },
          data: {
            total_favorites: {
              increment: 1,
            },
          },
        })

        return { action: 'added', isFavorite: true }
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    )
  }
}

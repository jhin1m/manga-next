import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ratingSubmissionSchema } from '@/types/rating'
import type { RatingSubmissionResponse, RatingErrorResponse } from '@/types/rating'

/**
 * POST /api/ratings
 * Submit or update a user's rating for a manga
 * Requires authentication
 */
export async function POST(request: Request): Promise<NextResponse<RatingSubmissionResponse | RatingErrorResponse>> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          details: 'You must be logged in to rate manga'
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = ratingSubmissionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      )
    }

    const { mangaId, rating } = validationResult.data
    const userId = parseInt(session.user.id)

    // Verify manga exists
    const manga = await prisma.comics.findUnique({
      where: { id: mangaId },
      select: { id: true }
    })

    if (!manga) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manga not found',
          details: `Manga with ID ${mangaId} does not exist`
        },
        { status: 404 }
      )
    }

    // Check if user already rated this manga
    const existingRating = await prisma.ratings.findUnique({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: mangaId
        }
      }
    })

    const wasFirstRating = !existingRating

    // Upsert rating (create or update)
    await prisma.ratings.upsert({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: mangaId
        }
      },
      update: {
        rating,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        comic_id: mangaId,
        rating
      }
    })

    // Calculate new statistics
    const stats = await prisma.ratings.aggregate({
      where: { comic_id: mangaId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    const averageRating = stats._avg.rating || 0
    const totalRatings = stats._count.rating || 0

    return NextResponse.json(
      {
        success: true,
        message: wasFirstRating ? 'Rating submitted successfully' : 'Rating updated successfully',
        data: {
          averageRating: Number(averageRating.toFixed(2)),
          totalRatings,
          userRating: rating,
          wasFirstRating
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in POST /api/ratings:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: 'An unexpected error occurred while processing your rating'
      },
      { status: 500 }
    )
  }
}

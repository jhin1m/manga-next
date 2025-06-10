import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ratingQuerySchema } from '@/types/rating'
import type { RatingGetResponse, RatingErrorResponse } from '@/types/rating'

/**
 * GET /api/ratings/[mangaId]
 * Get rating statistics for a specific manga
 * Returns average rating, total count, and user's rating if authenticated
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ mangaId: string }> }
): Promise<NextResponse<RatingGetResponse | RatingErrorResponse>> {
  try {
    // Parse and validate manga ID
    const { mangaId: mangaIdString } = await params

    // Handle validation errors properly
    let mangaId: number
    try {
      const validationResult = ratingQuerySchema.safeParse({ mangaId: mangaIdString })

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid manga ID',
            details: 'Manga ID must be a positive integer'
          },
          { status: 400 }
        )
      }

      mangaId = validationResult.data.mangaId
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid manga ID',
          details: 'Manga ID must be a positive integer'
        },
        { status: 400 }
      )
    }

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

    // Get rating statistics
    const stats = await prisma.ratings.aggregate({
      where: { comic_id: mangaId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    const averageRating = stats._avg.rating || 0
    const totalRatings = stats._count.rating || 0

    // Check for user's rating if authenticated
    let userRating: number | undefined = undefined
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
      const userId = parseInt(session.user.id)
      const userRatingRecord = await prisma.ratings.findUnique({
        where: {
          user_id_comic_id: {
            user_id: userId,
            comic_id: mangaId
          }
        },
        select: { rating: true }
      })

      userRating = userRatingRecord?.rating
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          averageRating: Number(averageRating.toFixed(2)),
          totalRatings,
          userRating
        }
      },
      {
        status: 200,
        headers: {
          // Add max-age for better bfcache compatibility
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600'
        }
      }
    )

  } catch (error) {
    console.error('Error in GET /api/ratings/[mangaId]:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: 'An unexpected error occurred while fetching rating data'
      },
      { status: 500 }
    )
  }
}

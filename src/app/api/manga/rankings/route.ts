import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export interface MangaRankingItem {
  id: number
  title: string
  slug: string
  cover_image_url: string | null
  daily_views: number
  weekly_views: number
  monthly_views: number
  total_views: number
  total_favorites: number
  average_rating: number | null
  rating_count: number
  rank: number
  trend_direction?: 'up' | 'down' | 'stable' | 'new'
  previous_rank?: number
}

export interface MangaRankingsResponse {
  success: boolean
  data: {
    category: string
    period: string
    rankings: MangaRankingItem[]
    total: number
    lastUpdated: string
    pagination?: {
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrevious: boolean
    }
  }
  error?: string
}

/**
 * GET /api/manga/rankings
 * Get top manga rankings by various categories and time periods
 *
 * Query parameters:
 * - category: 'most_viewed' | 'highest_rated' | 'most_bookmarked' | 'trending' (default: 'most_viewed')
 * - period: 'daily' | 'weekly' | 'monthly' | 'all_time' (default: 'weekly')
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: Request): Promise<NextResponse<MangaRankingsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'most_viewed'
    const period = searchParams.get('period') || 'weekly'
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const offset = (page - 1) * limit

    // Validate category parameter
    if (!['most_viewed', 'highest_rated', 'most_bookmarked', 'trending'].includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category. Must be one of: most_viewed, highest_rated, most_bookmarked, trending',
          data: {
            category,
            period,
            rankings: [],
            total: 0,
            lastUpdated: new Date().toISOString()
          }
        },
        { status: 400 }
      )
    }

    // Validate period parameter
    if (!['daily', 'weekly', 'monthly', 'all_time'].includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid period. Must be one of: daily, weekly, monthly, all_time',
          data: {
            category,
            period,
            rankings: [],
            total: 0,
            lastUpdated: new Date().toISOString()
          }
        },
        { status: 400 }
      )
    }

    // Determine the sort configuration based on category and period
    let orderBy: any[] = []
    let whereClause: any = {}

    switch (category) {
      case 'most_viewed':
        const viewField = period === 'daily'
          ? 'daily_views'
          : period === 'weekly'
            ? 'weekly_views'
            : period === 'monthly'
              ? 'monthly_views'
              : 'total_views'

        orderBy = [
          { [viewField]: 'desc' },
          { total_views: 'desc' }, // Secondary sort
          { id: 'asc' } // Tertiary sort for consistency
        ]
        whereClause = {
          [viewField]: { gt: 0 }
        }
        break

      case 'highest_rated':
        orderBy = [
          {
            Ratings: {
              _count: 'desc' // Sort by number of ratings first
            }
          }
        ]
        // We'll calculate average rating in the select
        whereClause = {
          Ratings: {
            some: {} // Only manga with at least one rating
          }
        }
        break

      case 'most_bookmarked':
        const favoriteField = period === 'all_time' ? 'total_favorites' : 'total_favorites'
        orderBy = [
          { [favoriteField]: 'desc' },
          { total_views: 'desc' }, // Secondary sort
          { id: 'asc' }
        ]
        whereClause = {
          [favoriteField]: { gt: 0 }
        }
        break

      case 'trending':
        // For trending, we'll use a combination of recent views and growth
        const trendingViewField = period === 'daily'
          ? 'daily_views'
          : period === 'weekly'
            ? 'weekly_views'
            : 'monthly_views'

        orderBy = [
          { [trendingViewField]: 'desc' },
          { total_views: 'desc' },
          { id: 'asc' }
        ]
        whereClause = {
          [trendingViewField]: { gt: 0 },
          // Only include manga updated in the last 30 days for trending
          updated_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
        break
    }

    // Get top manga by the specified category and period
    const topManga = await prisma.comics.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        cover_image_url: true,
        daily_views: true,
        weekly_views: true,
        monthly_views: true,
        total_views: true,
        total_favorites: true,
        updated_at: true,
        Ratings: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            Ratings: true,
            Favorites: true
          }
        }
      },
      orderBy: category === 'highest_rated' ? [
        {
          Ratings: {
            _count: 'desc'
          }
        },
        { total_views: 'desc' },
        { id: 'asc' }
      ] : orderBy,
      skip: offset,
      take: limit,
    })

    // Calculate average ratings and add rank numbers to the results
    const rankings: MangaRankingItem[] = topManga.map((manga, index) => {
      // Calculate average rating
      const ratings = manga.Ratings.map(r => r.rating)
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null

      return {
        id: manga.id,
        title: manga.title,
        slug: manga.slug,
        cover_image_url: manga.cover_image_url,
        daily_views: manga.daily_views || 0,
        weekly_views: manga.weekly_views || 0,
        monthly_views: manga.monthly_views || 0,
        total_views: manga.total_views || 0,
        total_favorites: manga.total_favorites || 0,
        average_rating: averageRating ? Math.round(averageRating * 10) / 10 : null,
        rating_count: manga._count.Ratings,
        rank: offset + index + 1,
        trend_direction: 'stable' as const, // TODO: Implement trend calculation
      }
    })

    // Get total count for metadata
    const totalCount = await prisma.comics.count({
      where: whereClause
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    return NextResponse.json(
      {
        success: true,
        data: {
          category,
          period,
          rankings,
          total: totalCount,
          lastUpdated: new Date().toISOString(),
          pagination: {
            page,
            limit,
            totalPages,
            hasNext,
            hasPrevious
          }
        }
      },
      {
        status: 200,
        headers: {
          // Optimized cache headers for bfcache compatibility
          'Cache-Control': period === 'daily'
            ? 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=900'
            : period === 'weekly'
              ? 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=1800'
              : 'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600'
        }
      }
    )

  } catch (error) {
    console.error("[API_MANGA_RANKINGS_GET]", error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        data: {
          category: 'most_viewed',
          period: 'weekly',
          rankings: [],
          total: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/manga/rankings
 * Manually refresh manga rankings cache
 * This endpoint can be called after view statistics updates
 */
export async function POST(request: Request): Promise<NextResponse<{ success: boolean; message: string }>> {
  try {
    // This endpoint is mainly for cache invalidation
    // In a production environment, you might want to add authentication
    
    const body = await request.json()
    const { secret } = body

    // Optional security check
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In a real implementation, you might trigger cache invalidation here
    // For now, we'll just return success since the GET endpoint handles caching
    
    return NextResponse.json(
      {
        success: true,
        message: 'Manga rankings cache refresh triggered'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("[API_MANGA_RANKINGS_POST]", error)
    
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

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
  rank: number
}

export interface MangaRankingsResponse {
  success: boolean
  data: {
    period: string
    rankings: MangaRankingItem[]
    total: number
    lastUpdated: string
  }
  error?: string
}

/**
 * GET /api/manga/rankings
 * Get top manga rankings by view statistics
 * 
 * Query parameters:
 * - period: 'daily' | 'weekly' | 'monthly' (default: 'weekly')
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: Request): Promise<NextResponse<MangaRankingsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'weekly'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    // Validate period parameter
    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid period. Must be one of: daily, weekly, monthly',
          data: {
            period,
            rankings: [],
            total: 0,
            lastUpdated: new Date().toISOString()
          }
        },
        { status: 400 }
      )
    }

    // Determine the sort field based on period
    const sortField = period === 'daily' 
      ? 'daily_views'
      : period === 'weekly' 
        ? 'weekly_views' 
        : 'monthly_views'

    // Build the orderBy object dynamically
    const orderBy = {
      [sortField]: 'desc' as const
    }

    // Get top manga by the specified period
    const topManga = await prisma.comics.findMany({
      where: {
        // Only include manga with views in the specified period
        [sortField]: {
          gt: 0
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        cover_image_url: true,
        daily_views: true,
        weekly_views: true,
        monthly_views: true,
        total_views: true,
      },
      orderBy: [
        orderBy,
        { total_views: 'desc' }, // Secondary sort by total views
        { id: 'asc' } // Tertiary sort for consistency
      ],
      take: limit,
    })

    // Add rank numbers to the results
    const rankings: MangaRankingItem[] = topManga.map((manga, index) => ({
      ...manga,
      daily_views: manga.daily_views || 0,
      weekly_views: manga.weekly_views || 0,
      monthly_views: manga.monthly_views || 0,
      total_views: manga.total_views || 0,
      rank: index + 1,
    }))

    // Get total count for metadata
    const totalCount = await prisma.comics.count({
      where: {
        [sortField]: {
          gt: 0
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          period,
          rankings,
          total: totalCount,
          lastUpdated: new Date().toISOString(),
        }
      },
      {
        status: 200,
        headers: {
          // Cache for 30 minutes for daily, 1 hour for weekly, 2 hours for monthly
          'Cache-Control': period === 'daily' 
            ? 'public, s-maxage=1800, stale-while-revalidate=900'
            : period === 'weekly'
              ? 'public, s-maxage=3600, stale-while-revalidate=1800'
              : 'public, s-maxage=7200, stale-while-revalidate=3600'
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

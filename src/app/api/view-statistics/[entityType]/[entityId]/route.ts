import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  calculateViewStatistics, 
  getAggregatedViewStatistics,
  type EntityType 
} from '@/lib/utils/viewStatistics'

/**
 * GET /api/view-statistics/[entityType]/[entityId]
 * Get time-based view statistics for a specific entity
 * 
 * Query parameters:
 * - period: 'current' | 'historical' (default: 'current')
 * - days: number of days for historical data (default: 30)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const { entityType, entityId } = await params
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || 'current'
    const days = parseInt(searchParams.get('days') || '30')

    // Validate entity type
    if (entityType !== 'comic' && entityType !== 'chapter') {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be "comic" or "chapter"' },
        { status: 400 }
      )
    }

    // Validate entity ID
    const id = parseInt(entityId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid entity ID' },
        { status: 400 }
      )
    }

    // Verify entity exists
    const entityExists = entityType === 'comic' 
      ? await prisma.comics.findUnique({ where: { id }, select: { id: true } })
      : await prisma.chapters.findUnique({ where: { id }, select: { id: true } })

    if (!entityExists) {
      return NextResponse.json(
        { error: `${entityType} not found` },
        { status: 404 }
      )
    }

    if (period === 'historical') {
      // Get historical data from View_Statistics table
      const historicalData = await getAggregatedViewStatistics(
        entityType as EntityType, 
        id, 
        days
      )

      return NextResponse.json({
        success: true,
        data: {
          entityType,
          entityId: id,
          period: 'historical',
          days,
          statistics: historicalData
        }
      })
    } else {
      // Get current statistics
      const currentStats = await calculateViewStatistics(entityType as EntityType, id)

      // Also get the stored statistics from the entity table
      const storedStats = entityType === 'comic'
        ? await prisma.comics.findUnique({
            where: { id },
            select: {
              daily_views: true,
              weekly_views: true,
              monthly_views: true,
              total_views: true
            }
          })
        : await prisma.chapters.findUnique({
            where: { id },
            select: {
              daily_views: true,
              weekly_views: true,
              monthly_views: true,
              view_count: true
            }
          })

      return NextResponse.json({
        success: true,
        data: {
          entityType,
          entityId: id,
          period: 'current',
          realTime: currentStats,
          stored: {
            daily_views: storedStats?.daily_views || 0,
            weekly_views: storedStats?.weekly_views || 0,
            monthly_views: storedStats?.monthly_views || 0,
            total_views: entityType === 'comic' 
              ? (storedStats as any)?.total_views || 0
              : (storedStats as any)?.view_count || 0
          }
        }
      })
    }

  } catch (error) {
    console.error("[API_VIEW_STATISTICS_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/view-statistics/[entityType]/[entityId]
 * Manually trigger view statistics update for a specific entity
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const { entityType, entityId } = await params

    // Validate entity type
    if (entityType !== 'comic' && entityType !== 'chapter') {
      return NextResponse.json(
        { error: 'Invalid entity type. Must be "comic" or "chapter"' },
        { status: 400 }
      )
    }

    // Validate entity ID
    const id = parseInt(entityId)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid entity ID' },
        { status: 400 }
      )
    }

    // Verify entity exists
    const entityExists = entityType === 'comic' 
      ? await prisma.comics.findUnique({ where: { id }, select: { id: true } })
      : await prisma.chapters.findUnique({ where: { id }, select: { id: true } })

    if (!entityExists) {
      return NextResponse.json(
        { error: `${entityType} not found` },
        { status: 404 }
      )
    }

    // Calculate and update statistics
    const statistics = await calculateViewStatistics(entityType as EntityType, id)

    if (entityType === 'comic') {
      await prisma.comics.update({
        where: { id },
        data: {
          daily_views: statistics.daily_views,
          weekly_views: statistics.weekly_views,
          monthly_views: statistics.monthly_views,
        },
      })
    } else {
      await prisma.chapters.update({
        where: { id },
        data: {
          daily_views: statistics.daily_views,
          weekly_views: statistics.weekly_views,
          monthly_views: statistics.monthly_views,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'View statistics updated successfully',
      data: {
        entityType,
        entityId: id,
        statistics
      }
    })

  } catch (error) {
    console.error("[API_VIEW_STATISTICS_POST]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

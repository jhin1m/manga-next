/**
 * View Statistics Utilities
 * Handles calculation and aggregation of time-based view statistics
 */

import { prisma } from '@/lib/db'

export type EntityType = 'comic' | 'chapter'
export type TimeRange = 'daily' | 'weekly' | 'monthly'

export interface ViewStatistics {
  daily_views: number
  weekly_views: number
  monthly_views: number
}

export interface ViewStatsResult {
  entityId: number
  entityType: EntityType
  statistics: ViewStatistics
}

/**
 * Calculate time-based view statistics for a specific entity
 */
export async function calculateViewStatistics(
  entityType: EntityType,
  entityId: number
): Promise<ViewStatistics> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  try {
    // Use Prisma's aggregation instead of raw SQL for better type safety
    const baseWhere = entityType === 'comic'
      ? { comic_id: entityId }
      : { chapter_id: entityId }

    // Calculate daily views (last 24 hours)
    const dailyViews = entityType === 'comic'
      ? await prisma.comic_Views.count({
          where: {
            ...baseWhere,
            viewed_at: {
              gte: oneDayAgo,
              lte: now,
            },
          },
        })
      : await prisma.chapter_Views.count({
          where: {
            ...baseWhere,
            viewed_at: {
              gte: oneDayAgo,
              lte: now,
            },
          },
        })

    // Calculate weekly views (last 7 days)
    const weeklyViews = entityType === 'comic'
      ? await prisma.comic_Views.count({
          where: {
            ...baseWhere,
            viewed_at: {
              gte: oneWeekAgo,
              lte: now,
            },
          },
        })
      : await prisma.chapter_Views.count({
          where: {
            ...baseWhere,
            viewed_at: {
              gte: oneWeekAgo,
              lte: now,
            },
          },
        })

    // Calculate monthly views (last 30 days)
    const monthlyViews = entityType === 'comic'
      ? await prisma.comic_Views.count({
          where: {
            ...baseWhere,
            viewed_at: {
              gte: oneMonthAgo,
              lte: now,
            },
          },
        })
      : await prisma.chapter_Views.count({
          where: {
            ...baseWhere,
            viewed_at: {
              gte: oneMonthAgo,
              lte: now,
            },
          },
        })

    return {
      daily_views: dailyViews,
      weekly_views: weeklyViews,
      monthly_views: monthlyViews,
    }
  } catch (error) {
    console.error(`Error calculating view statistics for ${entityType} ${entityId}:`, error)
    return {
      daily_views: 0,
      weekly_views: 0,
      monthly_views: 0,
    }
  }
}

/**
 * Update time-based view statistics for an entity
 */
export async function updateEntityViewStatistics(
  entityType: EntityType,
  entityId: number
): Promise<void> {
  try {
    const statistics = await calculateViewStatistics(entityType, entityId)
    
    if (entityType === 'comic') {
      await prisma.comics.update({
        where: { id: entityId },
        data: {
          daily_views: statistics.daily_views,
          weekly_views: statistics.weekly_views,
          monthly_views: statistics.monthly_views,
        },
      })
    } else {
      await prisma.chapters.update({
        where: { id: entityId },
        data: {
          daily_views: statistics.daily_views,
          weekly_views: statistics.weekly_views,
          monthly_views: statistics.monthly_views,
        },
      })
    }
  } catch (error) {
    console.error(`Error updating view statistics for ${entityType} ${entityId}:`, error)
  }
}

/**
 * Batch update view statistics for multiple entities
 */
export async function batchUpdateViewStatistics(
  entityType: EntityType,
  entityIds: number[]
): Promise<void> {
  const batchSize = 10 // Process in batches to avoid overwhelming the database
  
  for (let i = 0; i < entityIds.length; i += batchSize) {
    const batch = entityIds.slice(i, i + batchSize)
    const promises = batch.map(entityId => 
      updateEntityViewStatistics(entityType, entityId)
    )
    
    await Promise.all(promises)
    
    // Small delay between batches to prevent rate limiting
    if (i + batchSize < entityIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

/**
 * Get aggregated view statistics from the View_Statistics table
 */
export async function getAggregatedViewStatistics(
  entityType: EntityType,
  entityId: number,
  days: number = 30
): Promise<Array<{ date: Date; views: number }>> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await prisma.view_Statistics.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        date: true,
        daily_views: true,
      },
    })

    return stats.map(stat => ({
      date: stat.date,
      views: stat.daily_views,
    }))
  } catch (error) {
    console.error(`Error getting aggregated view statistics for ${entityType} ${entityId}:`, error)
    return []
  }
}

/**
 * Store daily view statistics snapshot
 */
export async function storeDailyViewSnapshot(
  entityType: EntityType,
  entityId: number,
  date: Date = new Date()
): Promise<void> {
  try {
    const statistics = await calculateViewStatistics(entityType, entityId)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    await prisma.view_Statistics.upsert({
      where: {
        entity_type_entity_id_date: {
          entity_type: entityType,
          entity_id: entityId,
          date: dateOnly,
        },
      },
      update: {
        daily_views: statistics.daily_views,
        weekly_views: statistics.weekly_views,
        monthly_views: statistics.monthly_views,
        updated_at: new Date(),
      },
      create: {
        entity_type: entityType,
        entity_id: entityId,
        date: dateOnly,
        daily_views: statistics.daily_views,
        weekly_views: statistics.weekly_views,
        monthly_views: statistics.monthly_views,
      },
    })
  } catch (error) {
    console.error(`Error storing daily view snapshot for ${entityType} ${entityId}:`, error)
  }
}

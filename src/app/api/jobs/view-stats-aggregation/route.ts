import { NextResponse } from 'next/server'
import { 
  runViewStatsAggregation,
  updateAllComicsViewStats,
  updateAllChaptersViewStats,
  storeDailySnapshots,
  cleanupOldViewStats
} from '@/lib/jobs/viewStatsAggregator'

/**
 * POST /api/jobs/view-stats-aggregation
 * Run view statistics aggregation job
 * 
 * Body parameters:
 * - action: 'full' | 'comics' | 'chapters' | 'snapshots' | 'cleanup' (default: 'full')
 * - daysToKeep: number (for cleanup action, default: 90)
 * - secret: string (optional security key)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action = 'full', daysToKeep = 90, secret } = body

    // Optional security check
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let result

    switch (action) {
      case 'comics':
        result = await updateAllComicsViewStats()
        break
      
      case 'chapters':
        result = await updateAllChaptersViewStats()
        break
      
      case 'snapshots':
        result = await storeDailySnapshots()
        break
      
      case 'cleanup':
        result = await cleanupOldViewStats(daysToKeep)
        break
      
      case 'full':
      default:
        result = await runViewStatsAggregation()
        break
    }

    return NextResponse.json({
      success: result.success,
      action,
      result
    }, {
      status: result.success ? 200 : 500
    })

  } catch (error) {
    console.error("[API_VIEW_STATS_AGGREGATION_POST]", error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/jobs/view-stats-aggregation
 * Get information about the view statistics aggregation job
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      info: {
        description: 'View Statistics Aggregation Job',
        actions: {
          full: 'Run complete aggregation (comics + chapters + snapshots)',
          comics: 'Update view statistics for all comics',
          chapters: 'Update view statistics for all chapters',
          snapshots: 'Store daily view snapshots',
          cleanup: 'Clean up old view statistics data'
        },
        usage: {
          endpoint: '/api/jobs/view-stats-aggregation',
          method: 'POST',
          body: {
            action: 'full | comics | chapters | snapshots | cleanup',
            daysToKeep: 'number (for cleanup action)',
            secret: 'string (optional security key)'
          }
        },
        scheduling: {
          recommended: {
            full: 'Every 6 hours',
            snapshots: 'Daily at midnight',
            cleanup: 'Weekly'
          },
          cron: {
            full: '0 */6 * * *',
            snapshots: '0 0 * * *',
            cleanup: '0 2 * * 0'
          }
        }
      }
    })

  } catch (error) {
    console.error("[API_VIEW_STATS_AGGREGATION_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

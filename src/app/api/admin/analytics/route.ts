import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth } from '@/lib/admin/middleware'
import { AdminRole, analyticsQuerySchema, AnalyticsData } from '@/types/admin'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/analytics
 * Get analytics data for admin dashboard
 */
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request, AdminRole.ADMIN)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { searchParams } = new URL(request.url)
    const query = analyticsQuerySchema.parse({
      period: searchParams.get('period') || 'week',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      type: searchParams.get('type')
    })

    const now = new Date()
    let startDate: Date
    let endDate: Date = query.endDate ? new Date(query.endDate) : now

    // Calculate start date based on period
    switch (query.period) {
      case 'day':
        startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        break
      case 'week':
        startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000) // Last 8 weeks
        break
      case 'month':
        startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
        break
      case 'year':
        startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000) // Last 5 years
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }

    const analytics: Record<string, AnalyticsData> = {}

    // User Analytics
    if (!query.type || query.type === 'users') {
      const userRegistrations = await getUserRegistrationAnalytics(startDate, endDate, query.period)
      analytics.userRegistrations = userRegistrations
    }

    // Views Analytics
    if (!query.type || query.type === 'views') {
      const viewsAnalytics = await getViewsAnalytics(startDate, endDate, query.period)
      analytics.views = viewsAnalytics
    }

    // Manga Analytics
    if (!query.type || query.type === 'manga') {
      const mangaAnalytics = await getMangaAnalytics(startDate, endDate, query.period)
      analytics.manga = mangaAnalytics
    }

    // Chapter Analytics
    if (!query.type || query.type === 'chapters') {
      const chapterAnalytics = await getChapterAnalytics(startDate, endDate, query.period)
      analytics.chapters = chapterAnalytics
    }

    // Popular Content Analytics
    const popularContent = await getPopularContentAnalytics(startDate, endDate)

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        popularContent,
        period: query.period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid query parameters',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('[ADMIN_ANALYTICS_ERROR]', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data'
      },
      { status: 500 }
    )
  }
}

/**
 * Get user registration analytics
 */
async function getUserRegistrationAnalytics(startDate: Date, endDate: Date, period: string): Promise<AnalyticsData> {
  const groupBy = getGroupByClause(period)
  
  const registrations = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT 
      DATE_TRUNC(${groupBy}, created_at) as date,
      COUNT(*) as count
    FROM "Users"
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE_TRUNC(${groupBy}, created_at)
    ORDER BY date ASC
  `

  const labels = registrations.map(r => formatDateLabel(r.date, period))
  const data = registrations.map(r => Number(r.count))

  return {
    labels,
    datasets: [{
      label: 'New Users',
      data,
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)'
    }]
  }
}

/**
 * Get views analytics
 */
async function getViewsAnalytics(startDate: Date, endDate: Date, period: string): Promise<AnalyticsData> {
  const groupBy = getGroupByClause(period)
  
  const [mangaViews, chapterViews] = await Promise.all([
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE_TRUNC(${groupBy}, viewed_at) as date,
        COUNT(*) as count
      FROM "Comic_Views"
      WHERE viewed_at >= ${startDate} AND viewed_at <= ${endDate}
      GROUP BY DATE_TRUNC(${groupBy}, viewed_at)
      ORDER BY date ASC
    `,
    prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE_TRUNC(${groupBy}, viewed_at) as date,
        COUNT(*) as count
      FROM "Chapter_Views"
      WHERE viewed_at >= ${startDate} AND viewed_at <= ${endDate}
      GROUP BY DATE_TRUNC(${groupBy}, viewed_at)
      ORDER BY date ASC
    `
  ])

  // Merge and align data
  const allDates = new Set([
    ...mangaViews.map(v => v.date),
    ...chapterViews.map(v => v.date)
  ])

  const labels = Array.from(allDates).sort().map(date => formatDateLabel(date, period))
  
  const mangaData = labels.map(label => {
    const view = mangaViews.find(v => formatDateLabel(v.date, period) === label)
    return view ? Number(view.count) : 0
  })

  const chapterData = labels.map(label => {
    const view = chapterViews.find(v => formatDateLabel(v.date, period) === label)
    return view ? Number(view.count) : 0
  })

  return {
    labels,
    datasets: [
      {
        label: 'Manga Views',
        data: mangaData,
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)'
      },
      {
        label: 'Chapter Views',
        data: chapterData,
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgba(168, 85, 247, 1)'
      }
    ]
  }
}

/**
 * Get manga analytics
 */
async function getMangaAnalytics(startDate: Date, endDate: Date, period: string): Promise<AnalyticsData> {
  const groupBy = getGroupByClause(period)
  
  const manga = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT 
      DATE_TRUNC(${groupBy}, created_at) as date,
      COUNT(*) as count
    FROM "Comics"
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE_TRUNC(${groupBy}, created_at)
    ORDER BY date ASC
  `

  const labels = manga.map(m => formatDateLabel(m.date, period))
  const data = manga.map(m => Number(m.count))

  return {
    labels,
    datasets: [{
      label: 'New Manga',
      data,
      backgroundColor: 'rgba(245, 158, 11, 0.5)',
      borderColor: 'rgba(245, 158, 11, 1)'
    }]
  }
}

/**
 * Get chapter analytics
 */
async function getChapterAnalytics(startDate: Date, endDate: Date, period: string): Promise<AnalyticsData> {
  const groupBy = getGroupByClause(period)
  
  const chapters = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT 
      DATE_TRUNC(${groupBy}, created_at) as date,
      COUNT(*) as count
    FROM "Chapters"
    WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    GROUP BY DATE_TRUNC(${groupBy}, created_at)
    ORDER BY date ASC
  `

  const labels = chapters.map(c => formatDateLabel(c.date, period))
  const data = chapters.map(c => Number(c.count))

  return {
    labels,
    datasets: [{
      label: 'New Chapters',
      data,
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      borderColor: 'rgba(239, 68, 68, 1)'
    }]
  }
}

/**
 * Get popular content analytics
 */
async function getPopularContentAnalytics(startDate: Date, endDate: Date) {
  const [popularManga, popularChapters, topGenres] = await Promise.all([
    // Most viewed manga
    prisma.comics.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            Comic_Views: {
              where: {
                viewed_at: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        Comic_Views: {
          _count: 'desc'
        }
      },
      take: 10
    }),

    // Most viewed chapters
    prisma.chapters.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        Comics: {
          select: {
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            Chapter_Views: {
              where: {
                viewed_at: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }
      },
      orderBy: {
        Chapter_Views: {
          _count: 'desc'
        }
      },
      take: 10
    }),

    // Top genres by manga count
    prisma.genres.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            Comic_Genres: true
          }
        }
      },
      orderBy: {
        Comic_Genres: {
          _count: 'desc'
        }
      },
      take: 10
    })
  ])

  return {
    popularManga,
    popularChapters,
    topGenres
  }
}

/**
 * Helper functions
 */
function getGroupByClause(period: string): string {
  switch (period) {
    case 'day':
      return 'day'
    case 'week':
      return 'week'
    case 'month':
      return 'month'
    case 'year':
      return 'year'
    default:
      return 'day'
  }
}

function formatDateLabel(date: string, period: string): string {
  const d = new Date(date)
  
  switch (period) {
    case 'day':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'week':
      return `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    case 'month':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    case 'year':
      return d.getFullYear().toString()
    default:
      return d.toLocaleDateString()
  }
}

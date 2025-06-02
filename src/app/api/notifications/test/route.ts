import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTestNotification, triggerNewChapterNotifications } from '@/lib/notifications'
import { prisma } from '@/lib/db'

/**
 * POST /api/notifications/test
 * Create test notifications for demonstration purposes
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type = 'test' } = body
    const userId = parseInt(session.user.id)

    if (type === 'test') {
      // Create a simple test notification
      const result = await createTestNotification(userId)
      
      if (result.success) {
        return NextResponse.json({
          message: 'Test notification created successfully',
          notification: result.notification,
        })
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }
    } else if (type === 'new_chapter') {
      // Create a test new chapter notification
      // First, find a manga that the user has favorited
      const userFavorite = await prisma.favorites.findFirst({
        where: { user_id: userId },
        include: {
          Comics: {
            select: {
              id: true,
              title: true,
              slug: true,
              Chapters: {
                orderBy: { chapter_number: 'desc' },
                take: 1,
                select: {
                  id: true,
                  slug: true,
                  chapter_number: true,
                },
              },
            },
          },
        },
      })

      if (!userFavorite) {
        return NextResponse.json(
          { error: 'You need to have at least one favorited manga to test new chapter notifications' },
          { status: 400 }
        )
      }

      const manga = userFavorite.Comics
      const latestChapter = manga.Chapters[0]
      const nextChapterNumber = latestChapter ? latestChapter.chapter_number + 1 : 1
      const testChapterSlug = `chapter-${nextChapterNumber}`

      // Trigger new chapter notification
      const result = await triggerNewChapterNotifications(
        manga.id,
        latestChapter?.id || 999999, // Use existing chapter ID or dummy ID for test
        nextChapterNumber,
        testChapterSlug,
        `Test Chapter ${nextChapterNumber}`
      )

      if (result.success) {
        return NextResponse.json({
          message: 'New chapter notification triggered successfully',
          notified_count: result.notified_count,
          manga_title: result.manga_title,
          chapter_number: result.chapter_number,
        })
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid test type. Use "test" or "new_chapter"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notifications/test
 * Get information about test notifications
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)

    // Get user's notification settings
    const settings = await prisma.notificationSettings.findUnique({
      where: { user_id: userId },
    })

    // Get user's favorites count
    const favoritesCount = await prisma.favorites.count({
      where: { user_id: userId },
    })

    // Get user's recent notifications
    const recentNotifications = await prisma.userNotification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      message: 'Test notification information',
      user_id: userId,
      notification_settings: settings || 'Not configured',
      favorites_count: favoritesCount,
      recent_notifications: recentNotifications,
      test_instructions: {
        test_notification: 'POST with {"type": "test"} to create a simple test notification',
        new_chapter_notification: 'POST with {"type": "new_chapter"} to simulate a new chapter notification (requires at least one favorited manga)',
      },
    })
  } catch (error) {
    console.error('Error fetching test notification info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test notification info' },
      { status: 500 }
    )
  }
}

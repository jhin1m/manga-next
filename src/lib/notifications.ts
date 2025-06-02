import { prisma } from '@/lib/db'

interface NotificationResult {
  success: boolean
  notified_count?: number
  manga_title?: string
  chapter_number?: number
  error?: string
}

interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  new_chapter_notifications: number
  users_with_notifications_enabled: number
}

/**
 * Utility function to trigger notifications for new chapter
 * This can be called from any chapter creation process
 */
export async function triggerNewChapterNotifications(
  comicId: number,
  chapterId: number,
  chapterNumber: number,
  chapterSlug: string,
  chapterTitle?: string
): Promise<NotificationResult> {
  try {
    // Get manga details
    const manga = await prisma.comics.findUnique({
      where: { id: comicId },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    if (!manga) {
      console.error(`Manga with ID ${comicId} not found`)
      return { success: false, error: 'Manga not found' }
    }

    // Get all users who have favorited this manga and have notifications enabled
    const usersToNotify = await prisma.favorites.findMany({
      where: {
        comic_id: comicId,
        Users: {
          NotificationSettings: {
            in_app_notifications: true,
            new_chapter_alerts: true,
          },
        },
      },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    if (usersToNotify.length === 0) {
      console.log(`No users to notify for manga: ${manga.title}`)
      return { success: true, notified_count: 0 }
    }

    // Create notifications for all users
    const notifications = usersToNotify.map((favorite) => ({
      user_id: favorite.user_id,
      type: 'new_chapter',
      title: `New Chapter Available!`,
      message: `Chapter ${chapterNumber}${chapterTitle ? `: ${chapterTitle}` : ''} of "${manga.title}" is now available.`,
      data: {
        comic_id: comicId,
        chapter_id: chapterId,
        chapter_slug: chapterSlug,
        chapter_number: chapterNumber,
        chapter_title: chapterTitle,
        manga_title: manga.title,
        manga_slug: manga.slug,
      },
    }))

    // Batch create notifications
    const result = await prisma.userNotification.createMany({
      data: notifications,
    })

    console.log(`Sent ${result.count} notifications for new chapter of ${manga.title}`)
    
    return {
      success: true,
      notified_count: result.count,
      manga_title: manga.title,
      chapter_number: chapterNumber,
    }
  } catch (error) {
    console.error('Error triggering new chapter notifications:', error)
    return { success: false, error: 'Failed to trigger notifications' }
  }
}

/**
 * Create a test notification for a user (useful for testing)
 */
export async function createTestNotification(userId: number): Promise<NotificationResult & { notification?: any }> {
  try {
    const notification = await prisma.userNotification.create({
      data: {
        user_id: userId,
        type: 'system',
        title: 'Welcome to Notifications!',
        message: 'This is a test notification to show how the notification system works.',
        data: {
          test: true,
        },
      },
    })

    return { success: true, notification }
  } catch (error) {
    console.error('Error creating test notification:', error)
    return { success: false, error: 'Failed to create test notification' }
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<NotificationStats | null> {
  try {
    const [
      totalNotifications,
      unreadNotifications,
      newChapterNotifications,
      usersWithNotifications,
    ] = await Promise.all([
      prisma.userNotification.count(),
      prisma.userNotification.count({ where: { is_read: false } }),
      prisma.userNotification.count({ where: { type: 'new_chapter' } }),
      prisma.notificationSettings.count({
        where: {
          in_app_notifications: true,
          new_chapter_alerts: true,
        },
      }),
    ])

    return {
      total_notifications: totalNotifications,
      unread_notifications: unreadNotifications,
      new_chapter_notifications: newChapterNotifications,
      users_with_notifications_enabled: usersWithNotifications,
    }
  } catch (error) {
    console.error('Error fetching notification statistics:', error)
    return null
  }
}

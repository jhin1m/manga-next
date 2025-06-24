import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validation schema for triggering notifications
const triggerNotificationSchema = z.object({
  comic_id: z.number().int().positive(),
  chapter_id: z.number().int().positive(),
  chapter_slug: z.string(),
  chapter_number: z.number(),
  chapter_title: z.string().optional(),
});

/**
 * POST /api/notifications/trigger
 * Trigger notifications for new chapter (admin only or system)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Check authorization - only admin or system can trigger notifications
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = triggerNotificationSchema.parse(body);
    const { comic_id, chapter_id, chapter_slug, chapter_number, chapter_title } = validatedData;

    // Get manga details
    const manga = await prisma.comics.findUnique({
      where: { id: comic_id },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    // Get all users who have favorited this manga and have notifications enabled
    const usersToNotify = await prisma.favorites.findMany({
      where: {
        comic_id: comic_id,
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
    });

    if (usersToNotify.length === 0) {
      return NextResponse.json({
        message: 'No users to notify',
        notified_count: 0,
      });
    }

    // Create notifications for all users
    const notifications = usersToNotify.map(favorite => ({
      user_id: favorite.user_id,
      type: 'new_chapter',
      title: `New Chapter Available!`,
      message: `Chapter ${chapter_number}${chapter_title ? `: ${chapter_title}` : ''} of "${manga.title}" is now available.`,
      data: {
        comic_id: comic_id,
        chapter_id: chapter_id,
        chapter_slug: chapter_slug,
        chapter_number: chapter_number,
        chapter_title: chapter_title,
        manga_title: manga.title,
        manga_slug: manga.slug,
      },
    }));

    // Batch create notifications
    const result = await prisma.userNotification.createMany({
      data: notifications,
    });

    return NextResponse.json({
      message: 'Notifications sent successfully',
      notified_count: result.count,
      manga_title: manga.title,
      chapter_number: chapter_number,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error triggering notifications:', error);
    return NextResponse.json({ error: 'Failed to trigger notifications' }, { status: 500 });
  }
}

/**
 * GET /api/notifications/trigger
 * Get notification trigger statistics (admin only)
 */
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get statistics about notifications
    const totalNotifications = await prisma.userNotification.count();
    const unreadNotifications = await prisma.userNotification.count({
      where: { is_read: false },
    });
    const newChapterNotifications = await prisma.userNotification.count({
      where: { type: 'new_chapter' },
    });

    // Get users with notification settings enabled
    const usersWithNotifications = await prisma.notificationSettings.count({
      where: {
        in_app_notifications: true,
        new_chapter_alerts: true,
      },
    });

    return NextResponse.json({
      statistics: {
        total_notifications: totalNotifications,
        unread_notifications: unreadNotifications,
        new_chapter_notifications: newChapterNotifications,
        users_with_notifications_enabled: usersWithNotifications,
      },
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch notification statistics' }, { status: 500 });
  }
}

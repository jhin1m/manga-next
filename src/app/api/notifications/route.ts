import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validation schema for pagination
const notificationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : 20)),
  unread_only: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

/**
 * GET /api/notifications
 * Get user's notifications with pagination - OPTIMIZED
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const { page, limit, unread_only } = notificationQuerySchema.parse(query);

    const userId = parseInt(session.user.id);
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      user_id: userId,
    };

    if (unread_only) {
      whereClause.is_read = false;
    }

    // OPTIMIZATION: Use Promise.all for parallel queries
    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      // Get notifications with pagination
      prisma.userNotification.findMany({
        where: whereClause,
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          data: true,
          is_read: true,
          created_at: true,
          read_at: true,
        },
      }),

      // Get total count for pagination (skip if only getting unread count)
      unread_only && limit === 1
        ? Promise.resolve(0) // Skip total count for unread count API
        : prisma.userNotification.count({ where: whereClause }),

      // Get unread count (optimize for unread_only queries)
      unread_only
        ? prisma.userNotification.count({ where: whereClause }) // Use proper count for unread_only
        : prisma.userNotification.count({
            where: {
              user_id: userId,
              is_read: false,
            },
          }),
    ]);

    // OPTIMIZATION: Skip formatting if only getting count
    const formattedNotifications =
      unread_only && limit === 1
        ? [] // Don't format notifications for count-only requests
        : notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            is_read: notification.is_read,
            created_at: notification.created_at,
            read_at: notification.read_at,
          }));

    // OPTIMIZATION: Calculate unread count from results when possible
    const finalUnreadCount = unread_only
      ? totalNotifications // For unread_only, total = unread
      : unreadCount;

    return NextResponse.json({
      notifications: formattedNotifications,
      unread_count: finalUnreadCount,
      pagination:
        unread_only && limit === 1
          ? null // Skip pagination for count-only requests
          : {
              total: totalNotifications,
              currentPage: page,
              totalPages: Math.ceil(totalNotifications / limit),
              perPage: limit,
            },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { user_id, type, title, message, data } = body;

    const notification = await prisma.userNotification.create({
      data: {
        user_id,
        type,
        title,
        message,
        data,
      },
    });

    return NextResponse.json({
      message: 'Notification created successfully',
      notification,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

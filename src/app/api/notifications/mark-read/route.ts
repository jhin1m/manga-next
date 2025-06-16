import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validation schema for marking notifications as read
const markReadSchema = z.object({
  notification_ids: z.array(z.number().int().positive()).optional(),
  mark_all: z.boolean().optional(),
});

/**
 * POST /api/notifications/mark-read
 * Mark notifications as read
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = markReadSchema.parse(body);
    const userId = parseInt(session.user.id);

    if (validatedData.mark_all) {
      // Mark all notifications as read for the user
      const result = await prisma.userNotification.updateMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });

      return NextResponse.json({
        message: 'All notifications marked as read',
        updated_count: result.count,
      });
    } else if (validatedData.notification_ids && validatedData.notification_ids.length > 0) {
      // Mark specific notifications as read
      const result = await prisma.userNotification.updateMany({
        where: {
          id: {
            in: validatedData.notification_ids,
          },
          user_id: userId, // Ensure user can only mark their own notifications
          is_read: false,
        },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Notifications marked as read',
        updated_count: result.count,
      });
    } else {
      return NextResponse.json(
        { error: 'Either notification_ids or mark_all must be provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error marking notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
  }
}

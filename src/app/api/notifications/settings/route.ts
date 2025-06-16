import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validation schema for notification settings
const notificationSettingsSchema = z.object({
  in_app_notifications: z.boolean().optional(),
  new_chapter_alerts: z.boolean().optional(),
});

/**
 * GET /api/notifications/settings
 * Get user's notification settings - OPTIMIZED
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);

    // OPTIMIZATION: Use upsert to get or create in single query
    const settings = await prisma.notificationSettings.upsert({
      where: { user_id: userId },
      update: {}, // No update needed, just return existing
      create: {
        user_id: userId,
        in_app_notifications: true,
        new_chapter_alerts: true,
      },
      select: {
        in_app_notifications: true,
        new_chapter_alerts: true,
      },
    });

    return NextResponse.json({
      settings: {
        in_app_notifications: settings.in_app_notifications,
        new_chapter_alerts: settings.new_chapter_alerts,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications/settings
 * Update user's notification settings
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = notificationSettingsSchema.parse(body);
    const userId = parseInt(session.user.id);

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: { user_id: userId },
      update: {
        ...validatedData,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        in_app_notifications: validatedData.in_app_notifications ?? true,
        new_chapter_alerts: validatedData.new_chapter_alerts ?? true,
      },
    });

    return NextResponse.json({
      message: 'Notification settings updated successfully',
      settings: {
        in_app_notifications: settings.in_app_notifications,
        new_chapter_alerts: settings.new_chapter_alerts,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 });
  }
}

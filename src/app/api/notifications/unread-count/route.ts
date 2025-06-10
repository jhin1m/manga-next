import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/notifications/unread-count
 * Get user's unread notification count - OPTIMIZED ENDPOINT
 * This is a dedicated lightweight endpoint for frequent polling
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)

    // OPTIMIZATION: Single optimized query for unread count only
    const unreadCount = await prisma.userNotification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    })

    // OPTIMIZATION: Minimal response for faster transfer
    return NextResponse.json({
      unread_count: unreadCount,
    }, {
      headers: {
        // Add cache headers for better performance
        'Cache-Control': 'private, max-age=30', // 30 seconds cache
        'ETag': `"${userId}-${unreadCount}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}

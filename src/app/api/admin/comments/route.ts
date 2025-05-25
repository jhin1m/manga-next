import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentQuerySchema, CommentStatus } from '@/types/comment'

/**
 * GET /api/admin/comments
 * Get comments for moderation (admin only)
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = commentQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sort: searchParams.get('sort') || 'newest',
      status: searchParams.get('status') || undefined,
    })

    // Build where clause for admin view
    const where = {
      ...(query.status ? { status: query.status } : {}),
    }

    // Build order by clause
    const orderBy = query.sort === 'newest' 
      ? { created_at: 'desc' as const }
      : query.sort === 'oldest'
        ? { created_at: 'asc' as const }
        : { likes_count: 'desc' as const }

    const offset = (query.page - 1) * query.limit

    // Fetch comments with moderation data
    const [comments, totalComments] = await Promise.all([
      prisma.comments.findMany({
        where,
        include: {
          Users: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              role: true,
              email: true,
            }
          },
          Comics: {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          },
          Chapters: {
            select: {
              id: true,
              title: true,
              chapter_number: true,
              slug: true,
            }
          },
          Comments: {
            select: {
              id: true,
              content: true,
              Users: {
                select: {
                  username: true
                }
              }
            }
          },
          CommentReports: {
            include: {
              Users: {
                select: {
                  id: true,
                  username: true,
                  role: true
                }
              }
            },
            orderBy: { created_at: 'desc' }
          },
          _count: {
            select: {
              other_Comments: true,
              CommentLikes: true,
              CommentReports: true,
            }
          }
        },
        orderBy,
        skip: offset,
        take: query.limit,
      }),
      prisma.comments.count({ where })
    ])

    // Get summary statistics
    const stats = await prisma.comments.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      comments,
      pagination: {
        total: totalComments,
        currentPage: query.page,
        totalPages: Math.ceil(totalComments / query.limit),
        perPage: query.limit,
      },
      stats: {
        total: totalComments,
        pending: statusCounts[CommentStatus.PENDING] || 0,
        approved: statusCounts[CommentStatus.APPROVED] || 0,
        rejected: statusCounts[CommentStatus.REJECTED] || 0,
        flagged: statusCounts[CommentStatus.FLAGGED] || 0,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_ADMIN_COMMENTS_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/comments
 * Bulk moderation actions (admin only)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const schema = z.object({
      action: z.enum(['approve', 'reject', 'flag', 'delete']),
      commentIds: z.array(z.number().int().positive()).min(1).max(100),
      reason: z.string().optional(),
    })

    const validatedData = schema.parse(body)
    const { action, commentIds, reason } = validatedData

    // Verify all comments exist
    const existingComments = await prisma.comments.findMany({
      where: { id: { in: commentIds } },
      select: { id: true }
    })

    if (existingComments.length !== commentIds.length) {
      return NextResponse.json(
        { error: 'Some comments were not found' },
        { status: 404 }
      )
    }

    let result: any

    switch (action) {
      case 'approve':
        result = await prisma.comments.updateMany({
          where: { id: { in: commentIds } },
          data: { status: CommentStatus.APPROVED }
        })
        break

      case 'reject':
        result = await prisma.comments.updateMany({
          where: { id: { in: commentIds } },
          data: { status: CommentStatus.REJECTED }
        })
        break

      case 'flag':
        result = await prisma.comments.updateMany({
          where: { id: { in: commentIds } },
          data: { status: CommentStatus.FLAGGED }
        })
        break

      case 'delete':
        result = await prisma.comments.deleteMany({
          where: { id: { in: commentIds } }
        })
        break
    }

    // Log moderation action (you might want to create a separate audit log table)
    console.log(`Admin ${session.user.id} performed ${action} on comments: ${commentIds.join(', ')}${reason ? ` - Reason: ${reason}` : ''}`)

    return NextResponse.json({
      message: `Successfully ${action}ed ${result.count} comment(s)`,
      affectedCount: result.count
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_ADMIN_COMMENTS_POST]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

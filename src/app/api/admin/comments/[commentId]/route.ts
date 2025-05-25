import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentModerationSchema } from '@/types/comment'

/**
 * PUT /api/admin/comments/[commentId]
 * Update comment status (admin only)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { commentId } = await params
    const id = parseInt(commentId)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = commentModerationSchema.parse(body)

    // Check if comment exists
    const existingComment = await prisma.comments.findUnique({
      where: { id },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Update comment status
    const updatedComment = await prisma.comments.update({
      where: { id },
      data: {
        status: validatedData.status as any,
        updated_at: new Date(),
      },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            role: true,
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
        CommentReports: {
          include: {
            Users: {
              select: {
                id: true,
                username: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            other_Comments: true,
            CommentLikes: true,
            CommentReports: true,
          }
        }
      }
    })

    // Log moderation action
    console.log(`Admin ${session.user.id} changed comment ${id} status from ${existingComment.status} to ${validatedData.status}`)

    // If comment is approved, clear any pending reports
    if (validatedData.status === 'APPROVED') {
      await prisma.commentReport.deleteMany({
        where: { comment_id: id }
      })
    }

    return NextResponse.json({
      message: `Comment status updated to ${validatedData.status}`,
      comment: updatedComment
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_ADMIN_COMMENT_PUT]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/comments/[commentId]
 * Get detailed comment information for moderation (admin only)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { commentId } = await params
    const id = parseInt(commentId)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    const comment = await prisma.comments.findUnique({
      where: { id },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            role: true,
            email: true,
            created_at: true,
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
        other_Comments: {
          include: {
            Users: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
                role: true,
              }
            },
          },
          orderBy: { created_at: 'asc' },
        },
        CommentLikes: {
          include: {
            Users: {
              select: {
                id: true,
                username: true,
                role: true
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
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Get user's comment history for context
    const userCommentStats = await prisma.comments.groupBy({
      by: ['status'],
      where: { user_id: comment.user_id },
      _count: {
        id: true
      }
    })

    const userStats = userCommentStats.reduce((acc: Record<string, number>, stat: any) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      comment,
      userStats: {
        totalComments: Object.values(userStats).reduce((sum: number, count: unknown) => sum + (count as number), 0),
        approved: userStats.APPROVED || 0,
        pending: userStats.PENDING || 0,
        rejected: userStats.REJECTED || 0,
        flagged: userStats.FLAGGED || 0,
      }
    })

  } catch (error) {
    console.error('[API_ADMIN_COMMENT_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

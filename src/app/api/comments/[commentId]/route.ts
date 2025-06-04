import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentUpdateSchema } from '@/types/comment'
import { validateCommentContent, cleanCommentContent } from '@/lib/utils/badWords'

/**
 * GET /api/comments/[commentId]
 * Get a specific comment with its replies
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params
    const id = parseInt(commentId)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    const comment = await prisma.comments.findUnique({
      where: { id },
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
        other_Comments: {
          where: { status: 'APPROVED' },
          include: {
            Users: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
                role: true,
              }
            },
            CommentLikes: userId ? {
              where: { user_id: userId },
              select: { is_like: true }
            } : false,
          },
          orderBy: { created_at: 'asc' },
        },
        CommentLikes: userId ? {
          where: { user_id: userId },
          select: { is_like: true }
        } : false,
        _count: {
          select: {
            other_Comments: {
              where: { status: 'APPROVED' }
            }
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

    // Add computed fields
    const commentWithUserData = {
      ...comment,
      userLikeStatus: comment.CommentLikes?.[0]?.is_like === true 
        ? 'like' as const
        : comment.CommentLikes?.[0]?.is_like === false 
          ? 'dislike' as const 
          : null,
      repliesCount: comment._count.other_Comments,
      other_Comments: comment.other_Comments?.map(reply => ({
        ...reply,
        userLikeStatus: reply.CommentLikes?.[0]?.is_like === true 
          ? 'like' as const
          : reply.CommentLikes?.[0]?.is_like === false 
            ? 'dislike' as const 
            : null,
      }))
    }

    return NextResponse.json({ comment: commentWithUserData })

  } catch (error) {
    console.error('[API_COMMENT_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/comments/[commentId]
 * Update a comment (only by the author)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
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
    const validatedData = commentUpdateSchema.parse(body)
    const userId = parseInt(session.user.id)

    // Check if comment exists and user owns it
    const existingComment = await prisma.comments.findUnique({
      where: { id },
      select: { id: true, user_id: true, created_at: true, edit_count: true }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Check if comment is too old to edit (24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (existingComment.created_at && existingComment.created_at < twentyFourHoursAgo) {
      return NextResponse.json(
        { error: 'Comments can only be edited within 24 hours of posting' },
        { status: 403 }
      )
    }

    // Check edit count limit (only allow one edit)
    if (existingComment.edit_count >= 1) {
      return NextResponse.json(
        { error: 'Comments can only be edited once' },
        { status: 403 }
      )
    }

    // Bad word and content validation
    const contentValidation = validateCommentContent(validatedData.content)
    if (!contentValidation.isValid) {
      // Convert ValidationError to user-friendly messages
      const errorMessages = contentValidation.errors.map(error => {
        switch (error.type) {
          case 'inappropriateContent':
            return `Nội dung chứa từ ngữ không phù hợp: ${error.data?.words?.join(', ') || ''}`
          case 'excessiveCaps':
            return 'Nội dung chứa quá nhiều chữ in hoa'
          case 'excessiveRepetition':
            return 'Nội dung chứa quá nhiều từ lặp lại'
          case 'tooManyLinks':
            return 'Nội dung chứa quá nhiều liên kết'
          default:
            return 'Nội dung không phù hợp'
        }
      })

      return NextResponse.json(
        {
          error: 'Nội dung không phù hợp',
          details: errorMessages
        },
        { status: 400 }
      )
    }

    // Clean the content
    const cleanedContent = cleanCommentContent(validatedData.content)

    // Update comment
    const updatedComment = await prisma.comments.update({
      where: { id },
      data: {
        content: cleanedContent,
        updated_at: new Date(),
        edit_count: existingComment.edit_count + 1,
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
      }
    })

    return NextResponse.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_COMMENT_PUT]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/comments/[commentId]
 * Delete a comment (by author or admin)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
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

    const userId = parseInt(session.user.id)
    const isAdmin = session.user.role === 'admin'

    // Check if comment exists
    const existingComment = await prisma.comments.findUnique({
      where: { id },
      select: { id: true, user_id: true }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (existingComment.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment (cascade will handle replies, likes, and reports)
    await prisma.comments.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Comment deleted successfully'
    })

  } catch (error) {
    console.error('[API_COMMENT_DELETE]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentLikeSchema } from '@/types/comment'

/**
 * POST /api/comments/[commentId]/like
 * Toggle like/dislike on a comment
 */
export async function POST(
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
    const validatedData = commentLikeSchema.parse(body)
    const userId = parseInt(session.user.id)

    // Check if comment exists
    const comment = await prisma.comments.findUnique({
      where: { id },
      select: { id: true, user_id: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Prevent users from liking their own comments
    if (comment.user_id === userId) {
      return NextResponse.json(
        { error: 'You cannot like your own comment' },
        { status: 400 }
      )
    }

    // Check if user has already liked/disliked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        user_id_comment_id: {
          user_id: userId,
          comment_id: id
        }
      }
    })

    let action: 'liked' | 'disliked' | 'removed' | 'changed'
    let newLikesCount: number
    let newDislikesCount: number

    if (existingLike) {
      if (existingLike.is_like === validatedData.is_like) {
        // Same action - remove the like/dislike
        await prisma.commentLike.delete({
          where: {
            user_id_comment_id: {
              user_id: userId,
              comment_id: id
            }
          }
        })
        action = 'removed'
      } else {
        // Different action - update the like/dislike
        await prisma.commentLike.update({
          where: {
            user_id_comment_id: {
              user_id: userId,
              comment_id: id
            }
          },
          data: {
            is_like: validatedData.is_like
          }
        })
        action = 'changed'
      }
    } else {
      // New like/dislike
      await prisma.commentLike.create({
        data: {
          user_id: userId,
          comment_id: id,
          is_like: validatedData.is_like
        }
      })
      action = validatedData.is_like ? 'liked' : 'disliked'
    }

    // Update comment counts
    const [likesCount, dislikesCount] = await Promise.all([
      prisma.commentLike.count({
        where: {
          comment_id: id,
          is_like: true
        }
      }),
      prisma.commentLike.count({
        where: {
          comment_id: id,
          is_like: false
        }
      })
    ])

    // Update the comment with new counts
    await prisma.comments.update({
      where: { id },
      data: {
        likes_count: likesCount,
        dislikes_count: dislikesCount
      }
    })

    newLikesCount = likesCount
    newDislikesCount = dislikesCount

    // Determine user's current like status
    let userLikeStatus: 'like' | 'dislike' | null = null
    if (action === 'liked' || (action === 'changed' && validatedData.is_like)) {
      userLikeStatus = 'like'
    } else if (action === 'disliked' || (action === 'changed' && !validatedData.is_like)) {
      userLikeStatus = 'dislike'
    }

    return NextResponse.json({
      message: action === 'liked' ? 'Comment liked' :
               action === 'disliked' ? 'Comment disliked' :
               action === 'changed' ? 'Like status changed' :
               'Like removed',
      likes_count: newLikesCount,
      dislikes_count: newDislikesCount,
      userLikeStatus
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_COMMENT_LIKE_POST]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/comments/[commentId]/like
 * Remove like/dislike from a comment
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

    // Check if comment exists
    const comment = await prisma.comments.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user has liked/disliked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        user_id_comment_id: {
          user_id: userId,
          comment_id: id
        }
      }
    })

    if (!existingLike) {
      return NextResponse.json(
        { error: 'You have not liked or disliked this comment' },
        { status: 400 }
      )
    }

    // Remove the like/dislike
    await prisma.commentLike.delete({
      where: {
        user_id_comment_id: {
          user_id: userId,
          comment_id: id
        }
      }
    })

    // Update comment counts
    const [likesCount, dislikesCount] = await Promise.all([
      prisma.commentLike.count({
        where: {
          comment_id: id,
          is_like: true
        }
      }),
      prisma.commentLike.count({
        where: {
          comment_id: id,
          is_like: false
        }
      })
    ])

    // Update the comment with new counts
    await prisma.comments.update({
      where: { id },
      data: {
        likes_count: likesCount,
        dislikes_count: dislikesCount
      }
    })

    return NextResponse.json({
      message: 'Like removed',
      likes_count: likesCount,
      dislikes_count: dislikesCount,
      userLikeStatus: null
    })

  } catch (error) {
    console.error('[API_COMMENT_LIKE_DELETE]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

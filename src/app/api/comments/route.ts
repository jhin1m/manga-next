import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  commentCreateSchema,
  commentQuerySchema,
  CommentStatus,
  COMMENT_RATE_LIMITS,
  COMMENT_VALIDATION
} from '@/types/comment'

/**
 * GET /api/comments
 * Get paginated comments for a manga or chapter
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = commentQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sort: searchParams.get('sort') || 'newest',
      status: searchParams.get('status') || undefined,
    })

    const comic_id = searchParams.get('comic_id')
    const chapter_id = searchParams.get('chapter_id')

    if (!comic_id && !chapter_id) {
      return NextResponse.json(
        { error: 'Either comic_id or chapter_id must be provided' },
        { status: 400 }
      )
    }

    // Build where clause
    const where = {
      ...(comic_id ? { comic_id: parseInt(comic_id) } : {}),
      ...(chapter_id ? { chapter_id: parseInt(chapter_id) } : {}),
      parent_comment_id: null, // Only top-level comments
      status: query.status || CommentStatus.APPROVED,
    }

    // Build order by clause
    const orderBy = query.sort === 'newest'
      ? { created_at: 'desc' as const }
      : query.sort === 'oldest'
        ? { created_at: 'asc' as const }
        : { likes_count: 'desc' as const }

    const offset = (query.page - 1) * query.limit

    // Get session for user-specific data
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    // Fetch comments with pagination
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
            }
          },
          Comics: comic_id ? {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          } : undefined,
          Chapters: chapter_id ? {
            select: {
              id: true,
              title: true,
              chapter_number: true,
              slug: true,
            }
          } : undefined,
          other_Comments: {
            where: { status: CommentStatus.APPROVED },
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
            take: 5, // Limit replies shown initially
          },
          CommentLikes: userId ? {
            where: { user_id: userId },
            select: { is_like: true }
          } : false,
          _count: {
            select: {
              other_Comments: {
                where: { status: CommentStatus.APPROVED }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: query.limit,
      }),
      prisma.comments.count({ where })
    ])

    // Add computed fields
    const commentsWithUserData = comments.map(comment => ({
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
    }))

    return NextResponse.json({
      comments: commentsWithUserData,
      pagination: {
        total: totalComments,
        currentPage: query.page,
        totalPages: Math.ceil(totalComments / query.limit),
        perPage: query.limit,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_COMMENTS_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/comments
 * Create a new comment (authenticated users only)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = commentCreateSchema.parse(body)
    const userId = parseInt(session.user.id)

    // Debug: Check if user exists in database
    const userExists = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    })

    if (!userExists) {
      console.error('[API_COMMENTS_POST] User not found in database:', {
        sessionUserId: session.user.id,
        parsedUserId: userId,
        sessionUser: session.user
      })
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 401 }
      )
    }

    // Rate limiting check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCommentsCount = await prisma.comments.count({
      where: {
        user_id: userId,
        created_at: { gte: oneHourAgo }
      }
    })

    if (recentCommentsCount >= COMMENT_RATE_LIMITS.MAX_COMMENTS_PER_HOUR) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before posting another comment.' },
        { status: 429 }
      )
    }

    // Check for recent duplicate content
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
    const recentComment = await prisma.comments.findFirst({
      where: {
        user_id: userId,
        created_at: { gte: thirtySecondsAgo }
      }
    })

    if (recentComment) {
      return NextResponse.json(
        { error: 'Please wait 30 seconds before posting another comment.' },
        { status: 429 }
      )
    }

    // Basic spam detection
    const content = validatedData.content.toLowerCase()
    const hasSpamKeywords = COMMENT_VALIDATION.SPAM_KEYWORDS.some(keyword =>
      content.includes(keyword.toLowerCase())
    )

    // Verify comic/chapter exists
    if (validatedData.comic_id) {
      const comic = await prisma.comics.findUnique({
        where: { id: validatedData.comic_id },
        select: { id: true }
      })
      if (!comic) {
        return NextResponse.json(
          { error: 'Comic not found' },
          { status: 404 }
        )
      }
    }

    if (validatedData.chapter_id) {
      const chapter = await prisma.chapters.findUnique({
        where: { id: validatedData.chapter_id },
        select: { id: true, comic_id: true }
      })
      if (!chapter) {
        return NextResponse.json(
          { error: 'Chapter not found' },
          { status: 404 }
        )
      }
      // If both comic_id and chapter_id provided, ensure they match
      if (validatedData.comic_id && chapter.comic_id !== validatedData.comic_id) {
        return NextResponse.json(
          { error: 'Chapter does not belong to the specified comic' },
          { status: 400 }
        )
      }
    }

    // Verify parent comment exists if provided
    if (validatedData.parent_comment_id) {
      const parentComment = await prisma.comments.findUnique({
        where: { id: validatedData.parent_comment_id },
        select: { id: true, comic_id: true, chapter_id: true }
      })
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }
      // Ensure parent comment is on the same comic/chapter
      if (validatedData.comic_id && parentComment.comic_id !== validatedData.comic_id) {
        return NextResponse.json(
          { error: 'Parent comment is not on the same comic' },
          { status: 400 }
        )
      }
      if (validatedData.chapter_id && parentComment.chapter_id !== validatedData.chapter_id) {
        return NextResponse.json(
          { error: 'Parent comment is not on the same chapter' },
          { status: 400 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comments.create({
      data: {
        user_id: userId,
        comic_id: validatedData.comic_id,
        chapter_id: validatedData.chapter_id,
        parent_comment_id: validatedData.parent_comment_id,
        content: validatedData.content,
        status: hasSpamKeywords ? CommentStatus.PENDING : CommentStatus.APPROVED,
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
        Comics: validatedData.comic_id ? {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        } : undefined,
        Chapters: validatedData.chapter_id ? {
          select: {
            id: true,
            title: true,
            chapter_number: true,
            slug: true,
          }
        } : undefined,
      }
    })

    return NextResponse.json(
      {
        message: hasSpamKeywords
          ? 'Comment submitted for review'
          : 'Comment posted successfully',
        comment: {
          ...comment,
          userLikeStatus: null,
          repliesCount: 0,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_COMMENTS_POST]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

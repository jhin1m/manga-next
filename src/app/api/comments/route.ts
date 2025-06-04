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
import { validateCommentContent, cleanCommentContent } from '@/lib/utils/badWords'

/**
 * GET /api/comments
 * Get paginated comments for a manga or chapter
 * Supports both offset-based and cursor-based pagination
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = commentQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sort: searchParams.get('sort') || 'newest',
      status: searchParams.get('status') || undefined,
    })

    const comic_id = searchParams.get('comic_id')
    const chapter_id = searchParams.get('chapter_id')
    const view_mode = searchParams.get('view_mode') || 'chapter' // 'chapter' or 'all'

    // Cursor-based pagination parameters
    const cursor = searchParams.get('cursor') // comment ID for cursor-based pagination
    const pagination_type = searchParams.get('pagination_type') || 'offset' // 'offset' or 'cursor'

    // Build where clause based on view mode
    let where: any = {
      parent_comment_id: null, // Only top-level comments
      status: query.status || CommentStatus.APPROVED,
    }

    // Always require comic_id
    if (!comic_id) {
      return NextResponse.json(
        { error: 'comic_id is required' },
        { status: 400 }
      )
    }

    where.comic_id = parseInt(comic_id)

    if (view_mode === 'all') {
      // Show both manga and chapter comments for this comic
      // No additional filter needed, just comic_id
    } else {
      // Default: show only specific comments (chapter or manga)
      if (chapter_id) {
        where.chapter_id = parseInt(chapter_id)
      }
    }

    // Build order by clause
    const orderBy = query.sort === 'newest'
      ? { created_at: 'desc' as const }
      : query.sort === 'oldest'
        ? { created_at: 'asc' as const }
        : { likes_count: 'desc' as const }

    // Get session for user-specific data
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ? parseInt(session.user.id) : null

    let comments, totalComments, nextCursor = null

    if (pagination_type === 'cursor') {
      // Cursor-based pagination
      if (cursor) {
        // If cursor is provided, add cursor condition to where clause
        const cursorComment = await prisma.comments.findUnique({
          where: { id: parseInt(cursor) },
          select: { created_at: true, likes_count: true }
        })

        if (!cursorComment) {
          return NextResponse.json(
            { error: 'Invalid cursor' },
            { status: 400 }
          )
        }

        // Add cursor condition to where clause
        if (query.sort === 'newest') {
          where.created_at = { lt: cursorComment.created_at }
        } else if (query.sort === 'oldest') {
          where.created_at = { gt: cursorComment.created_at }
        } else {
          // For most_liked, use likes_count and created_at as tiebreaker
          where.OR = [
            { likes_count: { lt: cursorComment.likes_count } },
            {
              likes_count: cursorComment.likes_count,
              created_at: { lt: cursorComment.created_at }
            }
          ]
        }
      }
      // If no cursor, start from the beginning (first page)

      // Fetch comments with cursor pagination
      comments = await prisma.comments.findMany({
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
          Chapters: {
            select: {
              id: true,
              title: true,
              chapter_number: true,
              slug: true,
            }
          },
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
        take: query.limit + 1, // Take one extra to check if there are more
      })

      // Check if there are more comments and set next cursor
      if (comments.length > query.limit) {
        const lastComment = comments[query.limit - 1]
        nextCursor = lastComment.id.toString()
        comments = comments.slice(0, query.limit) // Remove the extra comment
      }

      // For cursor pagination, we don't calculate total count for performance
      totalComments = null
    } else {
      // Offset-based pagination (default)
      const offset = (query.page - 1) * query.limit

      // Fetch comments with offset pagination
      const [commentsResult, totalCommentsResult] = await Promise.all([
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
            Chapters: {
              select: {
                id: true,
                title: true,
                chapter_number: true,
                slug: true,
              }
            },
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

      comments = commentsResult
      totalComments = totalCommentsResult
    }

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
      pagination: pagination_type === 'cursor' ? {
        perPage: query.limit,
        nextCursor,
        hasMore: nextCursor !== null,
      } : {
        total: totalComments,
        currentPage: query.page,
        totalPages: Math.ceil(totalComments! / query.limit),
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

    // Basic spam detection
    const content = cleanedContent.toLowerCase()
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
        content: cleanedContent,
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

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { CommentStatus } from '@/types/comment'

const querySchema = z.object({
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)),
})

/**
 * GET /api/comments/recent
 * Get recent approved comments across all manga
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      limit: searchParams.get('limit') || '10',
    })

    // Fetch recent approved comments
    const comments = await prisma.comments.findMany({
      where: {
        status: CommentStatus.APPROVED,
        parent_comment_id: null, // Only top-level comments
      },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
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
      },
      orderBy: { created_at: 'desc' },
      take: query.limit,
    })

    return NextResponse.json({
      comments,
      total: comments.length
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_COMMENTS_RECENT_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

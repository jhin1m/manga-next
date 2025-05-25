import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { commentReportSchema } from '@/types/comment'

/**
 * POST /api/comments/[commentId]/report
 * Report a comment for moderation
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
    const validatedData = commentReportSchema.parse(body)
    const userId = parseInt(session.user.id)

    // Check if comment exists
    const comment = await prisma.comments.findUnique({
      where: { id },
      select: { id: true, user_id: true, status: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Prevent users from reporting their own comments
    if (comment.user_id === userId) {
      return NextResponse.json(
        { error: 'You cannot report your own comment' },
        { status: 400 }
      )
    }

    // Check if user has already reported this comment
    const existingReport = await prisma.commentReport.findUnique({
      where: {
        user_id_comment_id: {
          user_id: userId,
          comment_id: id
        }
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this comment' },
        { status: 400 }
      )
    }

    // Create the report
    const report = await prisma.commentReport.create({
      data: {
        user_id: userId,
        comment_id: id,
        reason: validatedData.reason,
        details: validatedData.details,
      }
    })

    // Check if this comment should be automatically flagged
    // Flag if it receives 3 or more reports
    const reportCount = await prisma.commentReport.count({
      where: { comment_id: id }
    })

    if (reportCount >= 3 && comment.status !== 'FLAGGED') {
      await prisma.comments.update({
        where: { id },
        data: { status: 'FLAGGED' }
      })
    }

    return NextResponse.json({
      message: 'Comment reported successfully. Thank you for helping keep our community safe.',
      report: {
        id: report.id,
        reason: report.reason,
        created_at: report.created_at
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[API_COMMENT_REPORT_POST]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/comments/[commentId]/report
 * Get report status for a comment (admin only)
 */
export async function GET(
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

    // Get all reports for this comment
    const reports = await prisma.commentReport.findMany({
      where: { comment_id: id },
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
    })

    return NextResponse.json({
      reports,
      totalReports: reports.length
    })

  } catch (error) {
    console.error('[API_COMMENT_REPORT_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/comments/[commentId]/report
 * Remove a report (admin only or user removing their own report)
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
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('reportId')

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid comment ID' },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)
    const isAdmin = session.user.role === 'admin'

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

    if (reportId && isAdmin) {
      // Admin removing a specific report
      const reportIdNum = parseInt(reportId)
      if (isNaN(reportIdNum)) {
        return NextResponse.json(
          { error: 'Invalid report ID' },
          { status: 400 }
        )
      }

      await prisma.commentReport.delete({
        where: { id: reportIdNum }
      })

      return NextResponse.json({
        message: 'Report removed successfully'
      })
    } else {
      // User removing their own report
      const existingReport = await prisma.commentReport.findUnique({
        where: {
          user_id_comment_id: {
            user_id: userId,
            comment_id: id
          }
        }
      })

      if (!existingReport) {
        return NextResponse.json(
          { error: 'You have not reported this comment' },
          { status: 400 }
        )
      }

      await prisma.commentReport.delete({
        where: {
          user_id_comment_id: {
            user_id: userId,
            comment_id: id
          }
        }
      })

      return NextResponse.json({
        message: 'Report removed successfully'
      })
    }

  } catch (error) {
    console.error('[API_COMMENT_REPORT_DELETE]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

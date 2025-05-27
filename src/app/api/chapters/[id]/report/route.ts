import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { chapterReportSchema } from '@/types/chapter-report'

/**
 * POST /api/chapters/[id]/report
 * Report a chapter for content issues
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const chapterId = parseInt(id)

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = chapterReportSchema.parse(body)
    const userId = parseInt(session.user.id)

    // Check if chapter exists
    const chapter = await prisma.chapters.findUnique({
      where: { id: chapterId },
      select: { 
        id: true, 
        title: true, 
        chapter_number: true,
        Comics: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Check if user has already reported this chapter
    const existingReport = await prisma.chapterReport.findUnique({
      where: {
        user_id_chapter_id: {
          user_id: userId,
          chapter_id: chapterId
        }
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this chapter' },
        { status: 400 }
      )
    }

    // Create the report
    const report = await prisma.chapterReport.create({
      data: {
        user_id: userId,
        chapter_id: chapterId,
        reason: validatedData.reason,
        details: validatedData.details,
      }
    })

    return NextResponse.json({
      message: 'Chapter reported successfully. Thank you for helping us improve the content quality.',
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

    console.error('[API_CHAPTER_REPORT_POST]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chapters/[id]/report
 * Get all reports for a chapter (admin only)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const chapterId = parseInt(id)

    if (isNaN(chapterId)) {
      return NextResponse.json(
        { error: 'Invalid chapter ID' },
        { status: 400 }
      )
    }

    // Check if chapter exists
    const chapter = await prisma.chapters.findUnique({
      where: { id: chapterId },
      select: { id: true }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Get all reports for this chapter
    const reports = await prisma.chapterReport.findMany({
      where: { chapter_id: chapterId },
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
    console.error('[API_CHAPTER_REPORT_GET]', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

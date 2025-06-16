import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { chapterReportModerationSchema } from '@/types/chapter-report';

/**
 * GET /api/admin/chapter-reports
 * Get all chapter reports (admin only)
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const [reports, totalReports] = await Promise.all([
      prisma.chapterReport.findMany({
        where,
        include: {
          Users: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
          Chapters: {
            select: {
              id: true,
              title: true,
              chapter_number: true,
              Comics: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chapterReport.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      totalPages: Math.ceil(totalReports / limit),
      currentPage: page,
      totalReports,
    });
  } catch (error) {
    console.error('[API_ADMIN_CHAPTER_REPORTS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/chapter-reports
 * Update chapter report status (admin only)
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reportId, ...updateData } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const validatedData = chapterReportModerationSchema.parse(updateData);

    // Check if report exists
    const report = await prisma.chapterReport.findUnique({
      where: { id: parseInt(reportId) },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update the report
    const updatedReport = await prisma.chapterReport.update({
      where: { id: parseInt(reportId) },
      data: {
        status: validatedData.status,
        updated_at: new Date(),
      },
      include: {
        Users: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        Chapters: {
          select: {
            id: true,
            title: true,
            chapter_number: true,
            Comics: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Report status updated successfully',
      report: updatedReport,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[API_ADMIN_CHAPTER_REPORTS_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

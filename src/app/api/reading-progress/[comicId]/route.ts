import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/reading-progress/[comicId]
 * Remove reading progress for a specific comic
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ comicId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paramData = await params;
    const comicId = parseInt(paramData.comicId);

    if (isNaN(comicId)) {
      return NextResponse.json({ error: 'Invalid comic ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // Check if reading progress exists
    const existingProgress = await prisma.reading_Progress.findUnique({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: comicId,
        },
      },
    });

    if (!existingProgress) {
      return NextResponse.json({ error: 'Reading progress not found' }, { status: 404 });
    }

    // Delete the reading progress
    await prisma.reading_Progress.delete({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: comicId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reading progress removed successfully',
    });
  } catch (error) {
    console.error('Error removing reading progress:', error);
    return NextResponse.json({ error: 'Failed to remove reading progress' }, { status: 500 });
  }
}

/**
 * GET /api/reading-progress/[comicId]
 * Get reading progress for a specific comic
 */
export async function GET(request: Request, { params }: { params: Promise<{ comicId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paramData = await params;
    const comicId = parseInt(paramData.comicId);

    if (isNaN(comicId)) {
      return NextResponse.json({ error: 'Invalid comic ID' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // Get reading progress with related data
    const progress = await prisma.reading_Progress.findUnique({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: comicId,
        },
      },
      include: {
        Comics: {
          select: {
            id: true,
            title: true,
            slug: true,
            cover_image_url: true,
          },
        },
        Chapters: {
          select: {
            id: true,
            title: true,
            chapter_number: true,
            slug: true,
          },
        },
      },
    });

    if (!progress) {
      return NextResponse.json({ error: 'Reading progress not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json({ error: 'Failed to fetch reading progress' }, { status: 500 });
  }
}

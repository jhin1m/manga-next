import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateEntityViewStatistics } from '@/lib/utils/viewStatistics';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const paramData = await params;
    const id = parseInt(paramData.id);

    // Get chapter with pages
    const chapter = await prisma.chapters.findUnique({
      where: { id },
      include: {
        Pages: {
          orderBy: { page_number: 'asc' },
        },
        Comics: {
          select: {
            id: true,
            title: true,
            slug: true,
            cover_image_url: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Get previous and next chapters
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapters.findFirst({
        where: {
          comic_id: chapter.comic_id,
          chapter_number: {
            lt: chapter.chapter_number,
          },
        },
        orderBy: { chapter_number: 'desc' },
        select: { id: true, chapter_number: true, slug: true },
      }),
      prisma.chapters.findFirst({
        where: {
          comic_id: chapter.comic_id,
          chapter_number: {
            gt: chapter.chapter_number,
          },
        },
        orderBy: { chapter_number: 'asc' },
        select: { id: true, chapter_number: true, slug: true },
      }),
    ]);

    // Increment view count and record detailed view
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await Promise.all([
      // Increment total view count
      prisma.chapters.update({
        where: { id },
        data: { view_count: { increment: 1 } },
      }),
      // Record detailed view for statistics
      prisma.chapter_Views.create({
        data: {
          chapter_id: id,
          ip_address: clientIP.slice(0, 45), // Limit to database field size
          user_agent: userAgent.slice(0, 255), // Limit to reasonable size
          viewed_at: new Date(),
        },
      }),
    ]);

    // Update time-based view statistics asynchronously (don't wait)
    updateEntityViewStatistics('chapter', id).catch(error => {
      console.error(`Failed to update chapter ${id} view statistics:`, error);
    });

    // Also update parent comic view statistics
    updateEntityViewStatistics('comic', chapter.comic_id).catch(error => {
      console.error(`Failed to update comic ${chapter.comic_id} view statistics:`, error);
    });

    return NextResponse.json({
      chapter,
      prevChapter,
      nextChapter,
    });
  } catch (error) {
    console.error('[API_CHAPTER_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

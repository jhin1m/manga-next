import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateEntityViewStatistics } from '@/lib/utils/viewStatistics';

/**
 * POST /api/manga/[slug]/view
 * Track a view for a specific manga
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Get the manga
    const manga = await prisma.comics.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    // Get client information
    const clientIP =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await Promise.all([
      // Increment total view count
      prisma.comics.update({
        where: { id: manga.id },
        data: { total_views: { increment: 1 } },
      }),
      // Record detailed view for statistics
      prisma.comic_Views.create({
        data: {
          comic_id: manga.id,
          ip_address: clientIP.slice(0, 45), // Limit to database field size
          user_agent: userAgent.slice(0, 255), // Limit to reasonable size
          viewed_at: new Date(),
        },
      }),
    ]);

    // Update time-based view statistics asynchronously (don't wait)
    updateEntityViewStatistics('comic', manga.id).catch(error => {
      console.error(`Failed to update comic ${manga.id} view statistics:`, error);
    });

    return NextResponse.json({
      success: true,
      message: 'View recorded successfully',
    });
  } catch (error) {
    console.error('[API_MANGA_VIEW_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

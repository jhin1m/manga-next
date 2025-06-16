import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const all = searchParams.get('all') === 'true'; // Option to get all chapters
    const { slug } = await params;

    // Get the manga ID first
    const manga = await prisma.comics.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    // Get chapters with or without pagination
    const [chapters, totalChapters] = await Promise.all([
      prisma.chapters.findMany({
        where: { comic_id: manga.id },
        orderBy: { chapter_number: 'desc' },
        // Skip pagination if 'all' parameter is true
        ...(all
          ? {}
          : {
              skip: (page - 1) * limit,
              take: limit,
            }),
      }),
      prisma.chapters.count({
        where: { comic_id: manga.id },
      }),
    ]);

    return NextResponse.json({
      chapters,
      totalPages: all ? 1 : Math.ceil(totalChapters / limit),
      currentPage: all ? 1 : page,
      totalChapters,
    });
  } catch (error) {
    console.error('[API_MANGA_CHAPTERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

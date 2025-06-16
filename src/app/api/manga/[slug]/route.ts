import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const manga = await prisma.comics.findUnique({
      where: { slug },
      include: {
        Comic_Genres: {
          include: {
            Genres: true,
          },
        },
        Comic_Authors: {
          include: {
            Authors: true,
          },
        },
        Comic_Publishers: {
          include: {
            Publishers: true,
          },
        },
        Chapters: {
          orderBy: {
            chapter_number: 'desc',
          },
          take: 1,
          select: {
            id: true,
            chapter_number: true,
            title: true,
            slug: true,
            release_date: true,
          },
        },
      },
    });

    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }

    return NextResponse.json({ manga });
  } catch (error) {
    console.error('[API_MANGA_SLUG_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

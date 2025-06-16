import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validation schema for checking favorite status
const favoriteCheckSchema = z.object({
  comicId: z.number().int().positive(),
});

/**
 * POST /api/favorites/check
 * Check if a manga is in user's favorites
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = favoriteCheckSchema.parse(body);
    const userId = parseInt(session.user.id);
    const comicId = validatedData.comicId;

    // Check if the favorite exists
    const favorite = await prisma.favorites.findUnique({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: comicId,
        },
      },
    });

    return NextResponse.json(
      { isFavorite: !!favorite },
      {
        status: 200,
        headers: {
          // Cache for 5 minutes for authenticated users
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error checking favorite status:', error);
    return NextResponse.json({ error: 'Failed to check favorite status' }, { status: 500 });
  }
}

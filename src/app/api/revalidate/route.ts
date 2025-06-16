import { revalidateTag, revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand Revalidation API Endpoint
 *
 * This endpoint allows triggering cache revalidation for specific tags or paths
 * when data is updated in the database, solving the issue where PostgreSQL updates
 * don't automatically reflect in the NextJS application.
 *
 * Usage:
 * POST /api/revalidate
 * {
 *   "tags": ["manga-list", "manga-latest"],
 *   "paths": ["/manga", "/"],
 *   "secret": "optional-secret-key"
 * }
 */

interface RevalidationRequest {
  tags?: string[];
  paths?: string[];
  secret?: string;
  mangaSlug?: string;
  chapterId?: string;
  genreSlug?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RevalidationRequest = await request.json();
    const { tags = [], paths = [], secret, mangaSlug, chapterId, genreSlug } = body;

    // Optional security check
    if (process.env.REVALIDATION_SECRET && secret !== process.env.REVALIDATION_SECRET) {
      console.warn('Revalidation attempt with invalid secret');
      return NextResponse.json({ message: 'Invalid secret', success: false }, { status: 401 });
    }

    // Auto-generate tags and paths based on context
    const allTags = [...tags];
    const allPaths = [...paths];

    // Auto-generate tags for manga updates
    if (mangaSlug) {
      allTags.push(
        `manga-${mangaSlug}`,
        'manga-list',
        'manga-detail',
        'manga-latest',
        'manga-popular'
      );
      allPaths.push(`/manga/${mangaSlug}`);
    }

    // Auto-generate tags for chapter updates
    if (chapterId) {
      allTags.push(
        `chapter-${chapterId}`,
        'chapter-content',
        'manga-list' // Chapter updates affect manga list (latest chapter info)
      );
    }

    // Auto-generate tags for genre updates
    if (genreSlug) {
      allTags.push(`manga-genre-${genreSlug}`, 'genres', 'manga-list');
      allPaths.push(`/genres/${genreSlug}`);
    }

    // Remove duplicates
    const uniqueTags = [...new Set(allTags)];
    const uniquePaths = [...new Set(allPaths)];

    // Revalidate by tags
    const revalidatedTags: string[] = [];
    for (const tag of uniqueTags) {
      try {
        revalidateTag(tag);
        revalidatedTags.push(tag);
        console.log(`✅ Revalidated tag: ${tag}`);
      } catch (error) {
        console.error(`❌ Failed to revalidate tag ${tag}:`, error);
      }
    }

    // Revalidate by paths
    const revalidatedPaths: string[] = [];
    for (const path of uniquePaths) {
      try {
        revalidatePath(path);
        revalidatedPaths.push(path);
        console.log(`✅ Revalidated path: ${path}`);
      } catch (error) {
        console.error(`❌ Failed to revalidate path ${path}:`, error);
      }
    }

    const response = {
      success: true,
      message: 'Revalidation completed',
      timestamp: new Date().toISOString(),
      revalidated: {
        tags: revalidatedTags,
        paths: revalidatedPaths,
        count: revalidatedTags.length + revalidatedPaths.length,
      },
      context: {
        mangaSlug: mangaSlug || null,
        chapterId: chapterId || null,
        genreSlug: genreSlug || null,
      },
    };

    console.log('🔄 Revalidation summary:', response);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Revalidation error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error during revalidation',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing and health check
 */
export async function GET() {
  return NextResponse.json({
    message: 'On-demand Revalidation API is working',
    version: '1.0.0',
    usage: {
      method: 'POST',
      endpoint: '/api/revalidate',
      body: {
        tags: ['array of cache tags to revalidate'],
        paths: ['array of paths to revalidate'],
        secret: 'optional secret key for security',
        mangaSlug: 'auto-generates manga-related tags',
        chapterId: 'auto-generates chapter-related tags',
        genreSlug: 'auto-generates genre-related tags',
      },
    },
    examples: [
      {
        description: 'Revalidate manga list and homepage',
        body: {
          tags: ['manga-list', 'manga-latest'],
          paths: ['/manga', '/'],
        },
      },
      {
        description: 'Revalidate specific manga',
        body: {
          mangaSlug: 'one-piece',
        },
      },
      {
        description: 'Revalidate after chapter update',
        body: {
          mangaSlug: 'one-piece',
          chapterId: '123',
        },
      },
    ],
  });
}

/**
 * OPTIONS endpoint for CORS support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

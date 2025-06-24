import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validation schema for bulk sync
const bulkSyncSchema = z.object({
  progressItems: z.array(
    z.object({
      comic_id: z.number().int().positive(),
      last_read_chapter_id: z.number().int().positive().optional(),
      updated_at: z.string(),
    })
  ),
});

/**
 * POST /api/reading-progress/sync
 * Bulk sync reading progress from localStorage to database
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = bulkSyncSchema.parse(body);

    const userId = parseInt(session.user.id);
    const { progressItems } = validatedData;

    if (progressItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items to sync',
        syncedCount: 0,
        skippedCount: 0,
      });
    }

    let syncedCount = 0;
    let skippedCount = 0;
    const syncResults = [];

    // Process each progress item
    for (const item of progressItems) {
      try {
        // Check if comic exists
        const comic = await prisma.comics.findUnique({
          where: { id: item.comic_id },
          select: { id: true },
        });

        if (!comic) {
          skippedCount++;
          syncResults.push({
            comic_id: item.comic_id,
            status: 'skipped',
            reason: 'Comic not found',
          });
          continue;
        }

        // Check if chapter exists (if provided)
        if (item.last_read_chapter_id) {
          const chapter = await prisma.chapters.findUnique({
            where: { id: item.last_read_chapter_id },
            select: { id: true, comic_id: true },
          });

          if (!chapter || chapter.comic_id !== item.comic_id) {
            skippedCount++;
            syncResults.push({
              comic_id: item.comic_id,
              status: 'skipped',
              reason: 'Chapter not found or does not belong to comic',
            });
            continue;
          }
        }

        // Get existing progress to check if we should update
        const existingProgress = await prisma.reading_Progress.findUnique({
          where: {
            user_id_comic_id: {
              user_id: userId,
              comic_id: item.comic_id,
            },
          },
          select: { updated_at: true },
        });

        // Only update if the localStorage item is newer or doesn't exist in DB
        const itemDate = new Date(item.updated_at);
        const shouldUpdate =
          !existingProgress ||
          !existingProgress.updated_at ||
          itemDate > new Date(existingProgress.updated_at);

        if (!shouldUpdate) {
          skippedCount++;
          syncResults.push({
            comic_id: item.comic_id,
            status: 'skipped',
            reason: 'Database version is newer',
          });
          continue;
        }

        // Upsert the reading progress
        await prisma.reading_Progress.upsert({
          where: {
            user_id_comic_id: {
              user_id: userId,
              comic_id: item.comic_id,
            },
          },
          update: {
            last_read_chapter_id: item.last_read_chapter_id,
            updated_at: itemDate,
          },
          create: {
            user_id: userId,
            comic_id: item.comic_id,
            last_read_chapter_id: item.last_read_chapter_id,
            updated_at: itemDate,
          },
        });

        syncedCount++;
        syncResults.push({
          comic_id: item.comic_id,
          status: 'synced',
          reason: 'Successfully synced',
        });
      } catch (itemError) {
        console.error(`Error syncing item for comic ${item.comic_id}:`, itemError);
        skippedCount++;
        syncResults.push({
          comic_id: item.comic_id,
          status: 'error',
          reason: 'Database error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${syncedCount} synced, ${skippedCount} skipped`,
      syncedCount,
      skippedCount,
      results: syncResults,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error during bulk sync:', error);
    return NextResponse.json({ error: 'Failed to sync reading progress' }, { status: 500 });
  }
}

/**
 * GET /api/reading-progress/sync
 * Get sync status and unsynced items count
 */
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);

    // Get total reading progress count
    const totalProgress = await prisma.reading_Progress.count({
      where: { user_id: userId },
    });

    // Get recent sync activity (last 24 hours)
    const recentActivity = await prisma.reading_Progress.count({
      where: {
        user_id: userId,
        updated_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    return NextResponse.json({
      success: true,
      totalProgress,
      recentActivity,
      lastSyncCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json({ error: 'Failed to get sync status' }, { status: 500 });
  }
}

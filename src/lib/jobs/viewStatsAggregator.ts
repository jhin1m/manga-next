/**
 * View Statistics Aggregator Job
 * Scheduled job to calculate and update time-based view statistics
 */

import { prisma } from '@/lib/db'
import {
  calculateViewStatistics,
  updateEntityViewStatistics,
  batchUpdateViewStatistics,
  storeDailyViewSnapshot,
  type EntityType,
} from '@/lib/utils/viewStatistics'

export interface JobResult {
  success: boolean
  message: string
  processed: {
    comics: number
    chapters: number
  }
  errors: string[]
}

/**
 * Update view statistics for all comics
 */
export async function updateAllComicsViewStats(): Promise<JobResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let processedComics = 0

  try {
    console.log('🔄 Starting comics view statistics update...')

    // Get all comic IDs
    const comics = await prisma.comics.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
    })

    console.log(`📊 Found ${comics.length} comics to process`)

    // Update in batches
    const comicIds = comics.map(comic => comic.id)
    await batchUpdateViewStatistics('comic', comicIds)

    processedComics = comics.length
    const duration = Date.now() - startTime

    console.log(`✅ Comics view statistics updated successfully in ${duration}ms`)

    return {
      success: true,
      message: `Updated view statistics for ${processedComics} comics in ${duration}ms`,
      processed: { comics: processedComics, chapters: 0 },
      errors,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Comics update failed: ${errorMessage}`)
    console.error('❌ Error updating comics view statistics:', error)

    return {
      success: false,
      message: `Failed to update comics view statistics: ${errorMessage}`,
      processed: { comics: processedComics, chapters: 0 },
      errors,
    }
  }
}

/**
 * Update view statistics for all chapters
 */
export async function updateAllChaptersViewStats(): Promise<JobResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let processedChapters = 0

  try {
    console.log('🔄 Starting chapters view statistics update...')

    // Get all chapter IDs
    const chapters = await prisma.chapters.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
    })

    console.log(`📊 Found ${chapters.length} chapters to process`)

    // Update in batches
    const chapterIds = chapters.map(chapter => chapter.id)
    await batchUpdateViewStatistics('chapter', chapterIds)

    processedChapters = chapters.length
    const duration = Date.now() - startTime

    console.log(`✅ Chapters view statistics updated successfully in ${duration}ms`)

    return {
      success: true,
      message: `Updated view statistics for ${processedChapters} chapters in ${duration}ms`,
      processed: { comics: 0, chapters: processedChapters },
      errors,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Chapters update failed: ${errorMessage}`)
    console.error('❌ Error updating chapters view statistics:', error)

    return {
      success: false,
      message: `Failed to update chapters view statistics: ${errorMessage}`,
      processed: { comics: 0, chapters: processedChapters },
      errors,
    }
  }
}

/**
 * Store daily snapshots for all entities
 */
export async function storeDailySnapshots(): Promise<JobResult> {
  const startTime = Date.now()
  const errors: string[] = []
  let processedComics = 0
  let processedChapters = 0

  try {
    console.log('🔄 Starting daily snapshots storage...')

    // Get all entity IDs
    const [comics, chapters] = await Promise.all([
      prisma.comics.findMany({ select: { id: true } }),
      prisma.chapters.findMany({ select: { id: true } }),
    ])

    console.log(`📊 Found ${comics.length} comics and ${chapters.length} chapters for snapshots`)

    const today = new Date()

    // Store comic snapshots
    for (const comic of comics) {
      try {
        await storeDailyViewSnapshot('comic', comic.id, today)
        processedComics++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Comic ${comic.id} snapshot failed: ${errorMessage}`)
      }
    }

    // Store chapter snapshots
    for (const chapter of chapters) {
      try {
        await storeDailyViewSnapshot('chapter', chapter.id, today)
        processedChapters++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Chapter ${chapter.id} snapshot failed: ${errorMessage}`)
      }
    }

    const duration = Date.now() - startTime

    console.log(`✅ Daily snapshots stored successfully in ${duration}ms`)

    return {
      success: true,
      message: `Stored daily snapshots for ${processedComics} comics and ${processedChapters} chapters in ${duration}ms`,
      processed: { comics: processedComics, chapters: processedChapters },
      errors,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Daily snapshots failed: ${errorMessage}`)
    console.error('❌ Error storing daily snapshots:', error)

    return {
      success: false,
      message: `Failed to store daily snapshots: ${errorMessage}`,
      processed: { comics: processedComics, chapters: processedChapters },
      errors,
    }
  }
}

/**
 * Run complete view statistics aggregation job
 */
export async function runViewStatsAggregation(): Promise<JobResult> {
  const startTime = Date.now()
  console.log('🚀 Starting complete view statistics aggregation job...')

  try {
    // Run all aggregation tasks
    const [comicsResult, chaptersResult, snapshotsResult] = await Promise.all([
      updateAllComicsViewStats(),
      updateAllChaptersViewStats(),
      storeDailySnapshots(),
    ])

    const totalProcessed = {
      comics: comicsResult.processed.comics + snapshotsResult.processed.comics,
      chapters: chaptersResult.processed.chapters + snapshotsResult.processed.chapters,
    }

    const allErrors = [
      ...comicsResult.errors,
      ...chaptersResult.errors,
      ...snapshotsResult.errors,
    ]

    const duration = Date.now() - startTime
    const success = comicsResult.success && chaptersResult.success && snapshotsResult.success

    if (success) {
      console.log(`🎉 View statistics aggregation completed successfully in ${duration}ms`)
    } else {
      console.log(`⚠️ View statistics aggregation completed with errors in ${duration}ms`)
    }

    return {
      success,
      message: `Aggregation completed in ${duration}ms. Processed ${totalProcessed.comics} comics and ${totalProcessed.chapters} chapters.`,
      processed: totalProcessed,
      errors: allErrors,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const duration = Date.now() - startTime

    console.error('❌ View statistics aggregation failed:', error)

    return {
      success: false,
      message: `Aggregation failed after ${duration}ms: ${errorMessage}`,
      processed: { comics: 0, chapters: 0 },
      errors: [errorMessage],
    }
  }
}

/**
 * Clean up old view statistics data (older than specified days)
 */
export async function cleanupOldViewStats(daysToKeep: number = 90): Promise<JobResult> {
  const startTime = Date.now()

  try {
    console.log(`🧹 Cleaning up view statistics older than ${daysToKeep} days...`)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const deletedRecords = await prisma.view_Statistics.deleteMany({
      where: {
        date: {
          lt: cutoffDate,
        },
      },
    })

    const duration = Date.now() - startTime

    console.log(`✅ Cleaned up ${deletedRecords.count} old view statistics records in ${duration}ms`)

    return {
      success: true,
      message: `Cleaned up ${deletedRecords.count} old records in ${duration}ms`,
      processed: { comics: 0, chapters: 0 },
      errors: [],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const duration = Date.now() - startTime

    console.error('❌ Error cleaning up old view statistics:', error)

    return {
      success: false,
      message: `Cleanup failed after ${duration}ms: ${errorMessage}`,
      processed: { comics: 0, chapters: 0 },
      errors: [errorMessage],
    }
  }
}

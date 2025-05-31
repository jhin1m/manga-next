import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Validation schema for reading progress
const readingProgressSchema = z.object({
  comicId: z.number().int().positive(),
  chapterId: z.number().int().positive().optional(),
  pageNumber: z.number().int().positive().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
})

// Validation schema for bulk sync
const bulkSyncSchema = z.object({
  progressItems: z.array(z.object({
    comic_id: z.number().int().positive(),
    last_read_chapter_id: z.number().int().positive().optional(),
    updated_at: z.string(),
  }))
})

/**
 * GET /api/reading-progress
 * Get all reading progress for the current user
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Calculate offset
    const offset = (page - 1) * limit

    // Get reading progress with related data
    const [progressItems, totalCount] = await Promise.all([
      prisma.reading_Progress.findMany({
        where: { user_id: parseInt(session.user.id) },
        include: {
          Comics: {
            select: {
              id: true,
              title: true,
              slug: true,
              cover_image_url: true,
            }
          },
          Chapters: {
            select: {
              id: true,
              title: true,
              chapter_number: true,
              slug: true,
            }
          }
        },
        orderBy: { updated_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.reading_Progress.count({
        where: { user_id: parseInt(session.user.id) }
      })
    ])

    return NextResponse.json({
      progress: progressItems,
      pagination: {
        total: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        perPage: limit,
      },
    })
  } catch (error) {
    console.error('Error fetching reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reading progress' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reading-progress
 * Update or create reading progress for a manga
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = readingProgressSchema.parse(body)

    const userId = parseInt(session.user.id)
    const { comicId, chapterId, pageNumber, progressPercentage } = validatedData

    // Check if comic exists
    const comic = await prisma.comics.findUnique({
      where: { id: comicId },
      select: { id: true }
    })

    if (!comic) {
      return NextResponse.json(
        { error: 'Comic not found' },
        { status: 404 }
      )
    }

    // Check if chapter exists (if provided)
    if (chapterId) {
      const chapter = await prisma.chapters.findUnique({
        where: { id: chapterId },
        select: { id: true, comic_id: true }
      })

      if (!chapter || chapter.comic_id !== comicId) {
        return NextResponse.json(
          { error: 'Chapter not found or does not belong to this comic' },
          { status: 404 }
        )
      }
    }

    // Use transaction with retry logic to handle race conditions
    const maxRetries = 3
    let retryCount = 0
    let readingProgress

    while (retryCount < maxRetries) {
      try {
        readingProgress = await prisma.$transaction(async (tx) => {
          // First, try to find existing record
          const existing = await tx.reading_Progress.findUnique({
            where: {
              user_id_comic_id: {
                user_id: userId,
                comic_id: comicId,
              }
            }
          })

          if (existing) {
            // Update existing record
            return await tx.reading_Progress.update({
              where: {
                user_id_comic_id: {
                  user_id: userId,
                  comic_id: comicId,
                }
              },
              data: {
                last_read_chapter_id: chapterId,
                last_read_page_number: pageNumber,
                progress_percentage: progressPercentage,
                updated_at: new Date(),
              },
              include: {
                Comics: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    cover_image_url: true,
                  }
                },
                Chapters: {
                  select: {
                    id: true,
                    title: true,
                    chapter_number: true,
                    slug: true,
                  }
                }
              }
            })
          } else {
            // Create new record
            return await tx.reading_Progress.create({
              data: {
                user_id: userId,
                comic_id: comicId,
                last_read_chapter_id: chapterId,
                last_read_page_number: pageNumber,
                progress_percentage: progressPercentage,
                updated_at: new Date(),
              },
              include: {
                Comics: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    cover_image_url: true,
                  }
                },
                Chapters: {
                  select: {
                    id: true,
                    title: true,
                    chapter_number: true,
                    slug: true,
                  }
                }
              }
            })
          }
        })

        // If we get here, the transaction succeeded
        break

      } catch (transactionError: any) {
        retryCount++

        // If it's a unique constraint violation and we haven't exceeded retries, try again
        if (transactionError.code === 'P2002' && retryCount < maxRetries) {
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100))
          continue
        }

        // If it's not a constraint violation or we've exceeded retries, throw the error
        throw transactionError
      }
    }

    return NextResponse.json({
      success: true,
      progress: readingProgress,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Reading progress already exists for this manga. Please try again.' },
        { status: 409 }
      )
    }

    console.error('Error updating reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to update reading progress' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reading-progress
 * Clear all reading progress for the current user
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)

    await prisma.reading_Progress.deleteMany({
      where: { user_id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'All reading progress cleared'
    })
  } catch (error) {
    console.error('Error clearing reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to clear reading progress' },
      { status: 500 }
    )
  }
}

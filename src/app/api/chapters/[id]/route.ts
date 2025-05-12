import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Get chapter with pages
    const chapter = await prisma.chapters.findUnique({
      where: { id },
      include: {
        Pages: {
          orderBy: { page_number: 'asc' }
        },
        Comics: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Get previous and next chapters
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapters.findFirst({
        where: {
          comic_id: chapter.comic_id,
          chapter_number: {
            lt: chapter.chapter_number
          }
        },
        orderBy: { chapter_number: 'desc' },
        select: { id: true, chapter_number: true }
      }),
      prisma.chapters.findFirst({
        where: {
          comic_id: chapter.comic_id,
          chapter_number: {
            gt: chapter.chapter_number
          }
        },
        orderBy: { chapter_number: 'asc' },
        select: { id: true, chapter_number: true }
      })
    ])

    // Increment view count
    await prisma.chapters.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    })

    return NextResponse.json({
      chapter,
      prevChapter,
      nextChapter
    })
  } catch (error) {
    console.error("[API_CHAPTER_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

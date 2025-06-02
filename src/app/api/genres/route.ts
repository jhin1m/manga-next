import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Optimized: Get genres with manga count in a single query using aggregation
    // This eliminates the N+1 query problem
    const genresWithCount = await prisma.genres.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            Comic_Genres: true
          }
        }
      }
    })

    // Transform the result to match the expected format
    const formattedGenres = genresWithCount.map(genre => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      description: genre.description,
      created_at: genre.created_at,
      updated_at: genre.updated_at,
      mangaCount: genre._count.Comic_Genres
    }))

    return NextResponse.json({ genres: formattedGenres })
  } catch (error) {
    console.error("[API_GENRES_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

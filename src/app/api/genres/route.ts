import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get all genres
    const genres = await prisma.genres.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // For each genre, get the count of manga
    const genresWithCount = await Promise.all(
      genres.map(async (genre) => {
        const count = await prisma.comic_Genres.count({
          where: {
            genre_id: genre.id
          }
        })
        
        return {
          ...genre,
          mangaCount: count
        }
      })
    )

    return NextResponse.json({ genres: genresWithCount })
  } catch (error) {
    console.error("[API_GENRES_GET]", error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

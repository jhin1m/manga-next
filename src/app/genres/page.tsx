import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manga Genres | Manga Reader",
  description: "Browse manga by genre - action, adventure, comedy, drama, fantasy, and more.",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Fetch all genres directly from database
async function fetchGenres() {
  try {
    // Get all genres
    const genres = await prisma.genres.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // For each genre, get the count of manga
    const genresWithCount = await Promise.all(
      genres.map(async (genre: any) => {
        const count = await prisma.comic_Genres.count({
          where: {
            genre_id: genre.id
          }
        });

        return {
          ...genre,
          mangaCount: count
        };
      })
    );

    return genresWithCount;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

export default async function GenresPage() {
  const genres = await fetchGenres();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manga Genres</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {genres.map((genre: any) => (
          <Link key={genre.id} href={`/genres/${genre.slug}`}>
            <Card className="h-full hover:bg-accent transition-colors">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <h2 className="text-lg font-semibold mb-2">{genre.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {genre.mangaCount} {genre.mangaCount === 1 ? 'manga' : 'manga'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

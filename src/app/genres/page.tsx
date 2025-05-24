import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { safePrisma } from "@/lib/db-safe";

export const metadata: Metadata = {
  title: "Manga Genres | Manga Reader",
  description: "Browse manga by genre - action, adventure, comedy, drama, fantasy, and more.",
};

// Fetch all genres directly from database (safe for build time)
async function fetchGenres() {
  try {
    // Get all genres using safe database access
    const genres = await safePrisma.genres.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // For each genre, get the count of manga (with safe access)
    const genresWithCount = await Promise.all(
      genres.map(async (genre) => {
        // Use safePrisma for count as well
        const count = await safePrisma.comics.count({
          where: {
            Comic_Genres: {
              some: {
                genre_id: genre.id
              }
            }
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

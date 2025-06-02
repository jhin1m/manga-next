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

// Optimized: Fetch all genres with manga count in a single query
async function fetchGenres() {
  try {
    // Get genres with manga count using Prisma aggregation (eliminates N+1 queries)
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
    });

    // Transform the result to match the expected format
    return genresWithCount.map(genre => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      description: genre.description,
      created_at: genre.created_at,
      updated_at: genre.updated_at,
      mangaCount: genre._count.Comic_Genres
    }));
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

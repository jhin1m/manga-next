import Link from "next/link";
import MangaCard from "@/components/feature/MangaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fetch manga data from API
async function fetchMangaData(sort: string = 'latest', limit: number = 12) {
  try {
    const sortParam = sort === 'latest' ? 'latest' :
                      sort === 'popular' ? 'popular' : 'alphabetical';

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?sort=${sortParam}&limit=${limit}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch manga data');
    }

    const data = await res.json();
    return data.comics.map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
      slug: comic.slug,
      latestChapter: comic.Chapters && comic.Chapters.length > 0
        ? `Chapter ${comic.Chapters[0].chapter_number}`
        : 'No chapters yet',
      genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
      rating: comic.rating || Math.floor(Math.random() * 2) + 8, // Fallback random rating between 8-10
      views: comic.total_views || 0,
      chapterCount: comic._chapterCount || 0,
      updatedAt: comic.last_chapter_uploaded_at ? formatDate(comic.last_chapter_uploaded_at) : 'Recently',
      status: comic.status || 'Ongoing',
    }));
  } catch (error) {
    console.error('Error fetching manga data:', error);
    return [];
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}


// MangaGrid component for displaying manga with loading state
function MangaGrid({ manga }: { manga: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {manga.length > 0 ? (
        manga.map((item) => (
          <MangaCard key={item.id} {...item} />
        ))
      ) : (
        // Loading state
        Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="animate-pulse bg-muted aspect-[2/3] w-full h-auto rounded-md" />
            <div className="animate-pulse bg-muted h-4 w-full rounded-md" />
            <div className="animate-pulse bg-muted h-3 w-2/3 rounded-md" />
          </div>
        ))
      )}
    </div>
  );
}

export default async function Home() {
  // Fetch manga data for different tabs
  const latestManga = await fetchMangaData('latest', 12);
  const popularManga = await fetchMangaData('popular', 12);

  // Filter completed manga
  const completedManga = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?status=completed&limit=12`, {
    next: { revalidate: 3600 }
  })
    .then(res => res.ok ? res.json() : { comics: [] })
    .then(data => data.comics?.map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
      slug: comic.slug,
      latestChapter: comic.Chapters && comic.Chapters.length > 0
        ? `Chapter ${comic.Chapters[0].chapter_number}`
        : 'No chapters yet',
      genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
      rating: comic.rating || Math.floor(Math.random() * 2) + 8,
      views: comic.total_views || 0,
      chapterCount: comic._chapterCount || 0,
      updatedAt: comic.last_chapter_uploaded_at ? formatDate(comic.last_chapter_uploaded_at) : 'Completed',
      status: comic.status || 'Completed',
    })))
    .catch(error => {
      console.error('Error fetching completed manga:', error);
      return [];
    });

  return (
    <div className="space-y-8">
      {/* Main Grid Layout */}
      <section>
        <Tabs defaultValue="latest" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background border border-border/40">
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/manga">View More</Link>
            </Button>
          </div>

          <TabsContent value="latest" className="mt-0">
            <MangaGrid manga={latestManga} />
            <div className="mt-6">
              <Link href="/manga?sort=latest" className="text-sm text-primary hover:underline">
                View All Latest Manga →
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <MangaGrid manga={popularManga} />
            <div className="mt-6">
              <Link href="/manga?sort=popular" className="text-sm text-primary hover:underline">
                View All Popular Manga →
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <MangaGrid manga={completedManga} />
            <div className="mt-6">
              <Link href="/manga?status=completed" className="text-sm text-primary hover:underline">
                View All Completed Manga →
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

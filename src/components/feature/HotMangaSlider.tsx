import { mangaApi } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import HotMangaSliderClient, { type HotManga } from './HotMangaSliderClient';

// Server-side function to fetch hot manga data
async function fetchHotManga(): Promise<HotManga[]> {
  try {
    const data = await mangaApi.getList({
      sort: 'popular',
      limit: 10,
    });

    return data.comics.map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      coverImage: comic.cover_image_url || 'https://placehold.co/600x900/png',
      slug: comic.slug,
      rating: comic.rating || 0,
      views: comic.total_views || 0,
      status: comic.status || 'Ongoing',
      chapterCount: comic._chapterCount || 0,
      latestChapter: comic.Chapters && comic.Chapters.length > 0
        ? comic.Chapters[0].title
        : undefined,
      latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
        ? comic.Chapters[0].slug
        : undefined,
      updatedAt: comic.last_chapter_uploaded_at || undefined,
    }));
  } catch (error) {
    console.error('Error fetching hot manga data:', error);
    return [];
  }
}

export default async function HotMangaSlider() {
  // Fetch data on server side with NextJS cache (1 day revalidate)
  const hotManga = await fetchHotManga();

  // Error state - show skeleton if no data
  if (hotManga.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
          {/* Navigation buttons skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        {/* Slider container skeleton */}
        <div className="flex gap-4 overflow-hidden pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-16px)]"
            >
              {/* Manga card skeleton */}
              <div className="space-y-3">
                {/* Cover image skeleton */}
                <Skeleton className="w-full h-[280px] lg:h-[200px] xl:h-[200px] rounded-lg" />

                {/* Card content skeleton */}
                <div className="space-y-2 px-1">
                  {/* Title skeleton */}
                  <Skeleton className="h-4 w-full" />

                  {/* Rating and views skeleton */}
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* Latest chapter skeleton */}
                  <Skeleton className="h-3 w-3/4" />

                  {/* Updated date skeleton */}
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main component render - use client component for interactivity
  return <HotMangaSliderClient hotManga={hotManga} />;
}
import { mangaApi } from '@/lib/api/client';
// Removed loading overlay - using instant navigation
import HotMangaSliderClient, { type HotManga } from './HotMangaSliderClient';

// Preload component for critical images
function PreloadCriticalImages({ hotManga }: { hotManga: HotManga[] }) {
  // Preload first 2 images for LCP optimization
  const criticalImages = hotManga.slice(0, 2);

  return (
    <>
      {criticalImages.map((manga, index) => (
        <link
          key={manga.id}
          rel="preload"
          as="image"
          href={manga.coverImage}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      ))}
    </>
  );
}

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

  // Error state - show loading if no data
  if (hotManga.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading hot manga...</span>
        </div>
      </div>
    );
  }

  // Main component render - use client component for interactivity
  return (
    <>
      <PreloadCriticalImages hotManga={hotManga} />
      <HotMangaSliderClient hotManga={hotManga} />
    </>
  );
}
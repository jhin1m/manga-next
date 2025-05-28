"use client";

import { mangaApi } from '@/lib/api/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MangaCard from './MangaCard';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

export type HotManga = {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  rating: number;
  views: number;
  status?: string;
  chapterCount?: number;
  latestChapter?: string | undefined;
  latestChapterSlug?: string | undefined;
  updatedAt?: string;
};

export default function HotMangaSlider() {
  const [hotManga, setHotManga] = useState<HotManga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on client side
  useEffect(() => {
    async function fetchHotManga() {
      try {
        setIsLoading(true);
        const data = await mangaApi.getList({
          sort: 'popular',
          limit: 10,
        });

        const transformedData = data.comics.map((comic: any) => ({
          id: comic.id.toString(),
          title: comic.title,
          coverImage: comic.cover_image_url || 'https://placehold.co/600x900/png',
          slug: comic.slug,
          rating: comic.rating || Math.floor(Math.random() * 2) + 8,
          views: comic.total_views || 0,
          status: comic.status || 'Ongoing',
          chapterCount: comic._chapterCount || Math.floor(Math.random() * 100) + 10,
          latestChapter: comic.Chapters && comic.Chapters.length > 0
            ? comic.Chapters[0].title
            : undefined,
          latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
            ? comic.Chapters[0].slug
            : undefined,
          updatedAt: comic.last_chapter_uploaded_at ? formatDate(comic.last_chapter_uploaded_at) : 'Recently',
        }));

        setHotManga(transformedData);
      } catch (error) {
        console.error('Error fetching hot manga data:', error);
        setError('Failed to load hot manga');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHotManga();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    const slider = document.getElementById('hot-manga-slider');
    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.8;
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  const handleNext = () => {
    const slider = document.getElementById('hot-manga-slider');
    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.8;
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Loading state with skeleton
  if (isLoading) {
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

  // Error state
  if (error || hotManga.length === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Hot Manga</h2>
        </div>
        <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">{error || 'Failed to load hot manga. Please try again later.'}</p>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Hot Manga</h2>
        {/* Navigation buttons aligned with title */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-md transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-md transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slider container */}
      <div
        id="hot-manga-slider"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hotManga.map((item) => (
          <div
            key={item.id}
            className="snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-16px)]"
          >
            <MangaCard
              id={item.id}
              title={item.title}
              coverImage={item.coverImage}
              slug={item.slug}
              rating={item.rating}
              views={item.views}
              status={item.status}
              chapterCount={item.chapterCount}
              latestChapter={item.latestChapter}
              latestChapterSlug={item.latestChapterSlug}
              updatedAt={item.updatedAt}
            />
          </div>
        ))}
      </div>
    </div>
  );
}



"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MangaCard from './MangaCard';
import { Skeleton } from '@/components/ui/skeleton';

type HotManga = {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  rating: number;
  views: number;
  status?: string;
  chapterCount?: number;
};

// Chuyển hàm fetch vào component chính để tránh gọi nhiều lần

export default function HotMangaSlider() {
  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Hot Manga</h2>
        <div className="flex gap-2">
          <ClientSliderControls />
        </div>
      </div>
      <ClientSlider />
    </div>
  );
}

function ClientSliderControls() {
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

  return (
    <>
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
    </>
  );
}

function ClientSlider() {
  const [manga, setManga] = useState<HotManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch data in client component
  useEffect(() => {
    const fetchHotManga = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (!apiUrl) {
          throw new Error('API URL is not configured');
        }
        
        const timestamp = new Date().getTime();
        const res = await fetch(`${apiUrl}/api/manga?sort=popular&limit=10&_t=${timestamp}`);

        if (!res.ok) {
          throw new Error('Failed to fetch hot manga data');
        }

        const data = await res.json();
        const hotManga = data.comics.map((comic: any) => ({
          id: comic.id.toString(),
          title: comic.title,
          coverImage: comic.cover_image_url || 'https://placehold.co/600x900/png',
          slug: comic.slug,
          rating: comic.rating || Math.floor(Math.random() * 2) + 8,
          views: comic.total_views || 0,
          status: comic.status || 'Ongoing',
          chapterCount: comic.chapters?.length || Math.floor(Math.random() * 100) + 10,
        }));
        
        setManga(hotManga);
        setError(false);
      } catch (error) {
        console.error('Error fetching hot manga data:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHotManga();
  }, []);

  // Removed handlePrev and handleNext as they're now in ClientSliderControls

  if (loading) {
    return (
      <div className="w-full">
        <div 
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index} 
              className="snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-16px)]"
            >
              <div className="flex flex-col h-full rounded-lg overflow-hidden border bg-card shadow-sm">
                {/* Cover image skeleton with status position */}
                <div className="relative">
                  <Skeleton className="w-full h-[280px]" />
                  {/* Status position */}
                  <div className="absolute top-2 left-2">
                    <Skeleton className="w-16 h-5 rounded-full" />
                  </div>
                  {/* Chapter count position */}
                  <div className="absolute bottom-2 right-2">
                    <Skeleton className="w-12 h-5 rounded-full" />
                  </div>
                </div>
                
                {/* Content area */}
                <div className="p-3 flex flex-col gap-2">
                  {/* Title skeleton */}
                  <Skeleton className="w-full h-5" />
                  
                  {/* Rating and views skeleton */}
                  <div className="flex justify-between mt-1">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  
                  {/* Chapter skeleton */}
                  <div className="mt-auto pt-2">
                    <Skeleton className="w-24 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error || manga.length === 0) {
    return (
      <div className="w-full h-[300px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load hot manga. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Slider container */}
      <div 
        id="hot-manga-slider"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {manga.map((item) => (
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
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons removed from here and moved to header */}
    </div>
  );
}

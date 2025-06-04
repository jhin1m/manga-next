"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import MangaCard from './MangaCard';
import { useTranslations } from 'next-intl';

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

interface HotMangaSliderClientProps {
  hotManga: HotManga[];
}

export default function HotMangaSliderClient({ hotManga }: HotMangaSliderClientProps) {
  const t = useTranslations('manga');

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

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t('hotManga')}</h2>
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
            className="snap-start flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-16px)] 2xl:w-[calc(16.666%-16px)]"
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

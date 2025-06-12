"use client";

import MangaCard from '@/components/feature/MangaCard';
// Removed loading overlay - using instant navigation
import { useTranslations } from 'next-intl';

// Define manga type for this component
type Manga = {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
  latestChapterSlug?: string;
  genres: string[];
  rating: number;
  views: number;
  chapterCount: number;
  updatedAt?: string;
  status: string;
};

interface LatestUpdateMangaListClientProps {
  manga: Manga[];
  isLoading?: boolean;
  limit?: number;
}

export default function LatestUpdateMangaListClient({
  manga,
  isLoading = false,
  limit = 12
}: LatestUpdateMangaListClientProps) {
  const t = useTranslations('manga');

  // No loading state - instant display

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t('latestUpdates')}</h2>
      </div>

      {manga.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {manga.map((item: Manga) => (
            <MangaCard
              key={item.id}
              title={item.title}
              coverImage={item.coverImage}
              slug={item.slug}
              latestChapter={item.latestChapter}
              latestChapterSlug={item.latestChapterSlug}
              genres={item.genres}
              rating={item.rating}
              views={item.views}
              chapterCount={item.chapterCount}
              updatedAt={item.updatedAt}
              status={item.status}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('noMangaFound')}
          </p>
        </div>
      )}
    </div>
  );
}

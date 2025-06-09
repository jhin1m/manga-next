"use client";

import MangaCard from '@/components/feature/MangaCard';
import { Skeleton } from '@/components/ui/skeleton';
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-3 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              {...item} 
              showFavoriteButton={true}
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

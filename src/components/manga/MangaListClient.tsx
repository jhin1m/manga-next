"use client";

import { useEffect } from 'react';
import FilterSortBar from '@/components/feature/FilterSortBar';
import MangaCard from '@/components/feature/MangaCard';
import PaginationWrapper from '@/components/feature/PaginationWrapper';
// Removed loading overlay - using instant navigation
import { useTranslations } from 'next-intl';

interface MangaItem {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
  latestChapterSlug?: string;
  genres?: string[];
  rating?: number;
  views?: number;
  chapterCount?: number;
  updatedAt?: string;
  status?: string;
}

interface MangaListClientProps {
  manga: MangaItem[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  sort: string;
  status?: string;
  genre?: string;
  pageTitle: string;
  baseUrl: string;
}

export default function MangaListClient({
  manga,
  currentPage,
  totalPages,
  totalResults,
  sort,
  status,
  genre,
  pageTitle,
  baseUrl
}: MangaListClientProps) {
  const t = useTranslations('search');

  // Ensure scroll to top when component mounts (especially important for mobile)
  useEffect(() => {
    // Only scroll to top if we're on page 2 or higher (coming from ViewMoreButton or pagination)
    if (currentPage > 1) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  return (
    <div className="container mx-auto py-8">
      {/* Page title - always visible */}
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>

      {/* Filter bar */}
      <div className="mb-6">
        <FilterSortBar />
      </div>

      {/* Manga grid with loading state - Fixed container to prevent scroll jumping */}
      <div className="skeleton-container">
        {manga.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
              {manga.map((item: MangaItem) => (
                <div key={item.id}>
                  <MangaCard
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
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('noResults')}
            </p>
          </div>
        )}
      </div>

      {/* Pagination with loading state */}
      {manga.length > 0 && (
        <>
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={baseUrl}
          />
        </>
      )}
    </div>
  );
}

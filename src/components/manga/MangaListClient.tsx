"use client";

import { useState, useEffect } from 'react';
import FilterSortBarClient from '@/components/feature/FilterSortBarClient';
import MangaCard from '@/components/feature/MangaCard';
import PaginationWrapper from '@/components/feature/PaginationWrapper';
import {
  MangaGridSkeleton,
  PaginationSkeleton
} from '@/components/ui/skeletons/MangaListSkeleton';
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
  const [loadingStates, setLoadingStates] = useState({
    filterBar: true,
    mangaGrid: true,
    pagination: true,
  });

  const t = useTranslations('search');

  // Progressive loading effect
  useEffect(() => {
    const timeouts = [
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, filterBar: false }));
      }, 100),
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, mangaGrid: false }));
      }, 300),
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, pagination: false }));
      }, 600),
    ];

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="container mx-auto py-8">
      {/* Page title - always visible */}
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>

      {/* Filter bar with loading state */}
      <div className="mb-6">
        <FilterSortBarClient
          showLoadingEffect={loadingStates.filterBar}
          loadingDelay={100}
        />
      </div>

      {/* Manga grid with loading state */}
      {manga.length > 0 ? (
        <>
          {loadingStates.mangaGrid ? (
            <MangaGridSkeleton itemCount={24} showStaggered={true} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
              {manga.map((item: MangaItem, index) => (
                <div
                  key={item.id}
                  className="transition-all duration-300"
                  style={{
                    opacity: loadingStates.mangaGrid ? 0 : 1,
                    transform: loadingStates.mangaGrid ? 'translateY(10px)' : 'translateY(0)',
                    transitionDelay: `${index * 30}ms`
                  }}
                >
                  <MangaCard
                    {...item as any}
                    showFavoriteButton={true}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination with loading state */}
          {loadingStates.pagination ? (
            <PaginationSkeleton />
          ) : (
            <PaginationWrapper
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={baseUrl}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('noResults')}
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { lazy } from 'react';
import MangaChapterList from '@/components/manga/MangaChapterList';
import RelatedManga from '@/components/manga/RelatedManga';
import { MangaDetailInfo } from '@/components/manga/MangaDetailInfo';

// Lazy load heavy components
const CommentSectionLazy = lazy(() => import('@/components/feature/comments/CommentSectionLazy'));

interface MangaDetailClientProps {
  manga: {
    id: number;
    title: string;
    alternativeTitles: string[];
    coverImage: string;
    slug: string;
    author: string;
    artist: string;
    genres: { name: string; slug: string }[];
    status: string;
    views: number;
    favorites: number;
    chapterCount: number;
    updatedAt: string | null;
    publishedYear: string | number;
    serialization: string;
    description: string;
  };
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    slug: string;
    releaseDate: string;
    views: number;
  }>;
  relatedManga: Array<{
    id: string;
    title: string;
    coverImage: string;
    slug: string;
    latestChapter?: string;
    genres?: string[];
    views?: number;
    chapterCount?: number;
    updatedAt?: string;
    status?: string;
  }>;
  initialFavoriteStatus?: boolean;
  initialRatingData?: {
    averageRating: number;
    totalRatings: number;
    userRating: number;
  };
}

export default function MangaDetailClient({
  manga,
  chapters,
  relatedManga,
  initialFavoriteStatus,
  initialRatingData,
}: MangaDetailClientProps) {
  return (
    <div className='space-y-8'>
      {/* Manga Information Section - Direct render without fake loading */}
      <MangaDetailInfo
        manga={manga}
        chapters={chapters}
        initialFavoriteStatus={initialFavoriteStatus}
        initialRatingData={initialRatingData}
      />

      {/* Chapters and Related Manga Section - Direct render */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Chapters Section */}
        <section className='lg:col-span-3'>
          <MangaChapterList mangaSlug={manga.slug} chapters={chapters} />
        </section>

        {/* Related Manga Section */}
        <section className='lg:col-span-1'>
          <RelatedManga relatedManga={relatedManga} />
        </section>
      </div>

      {/* Comments Section */}
      <section className='mt-8'>
        <CommentSectionLazy
          mangaId={manga.id}
          mangaSlug={manga.slug}
          defaultViewMode='all'
          hideToggle={true}
          paginationType='cursor'
          delayMs={300} // Delay loading to prevent race conditions
          key={`comments-${manga.id}`} // Add key to prevent unnecessary re-mounts
        />
      </section>
    </div>
  );
}

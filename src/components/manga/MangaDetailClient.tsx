"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import MangaChapterList from "@/components/manga/MangaChapterList";
import RelatedManga from "@/components/manga/RelatedManga";
import MangaDetailInfoClient from "@/components/manga/MangaDetailInfoClient";

// Lazy load heavy components
const CommentSectionLazy = lazy(() => import("@/components/feature/comments/CommentSectionLazy"));
import {
  CommentSectionSkeleton
} from "@/components/ui/skeletons/MangaDetailSkeleton";
import {
  AnimatedChapterListSkeleton,
  AnimatedRelatedMangaSkeleton
} from "@/components/ui/skeletons/AnimatedMangaSkeleton";

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
}

export default function MangaDetailClient({ 
  manga, 
  chapters, 
  relatedManga 
}: MangaDetailClientProps) {
  const [loadingStates, setLoadingStates] = useState({
    chapters: true,
    relatedManga: true,
    comments: true,
  });

  // Progressive loading effect
  useEffect(() => {
    const timeouts = [
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, chapters: false }));
      }, 100),
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, relatedManga: false }));
      }, 200),
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, comments: false }));
      }, 300),
    ];

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Manga Information Section - With loading effect */}
      <MangaDetailInfoClient manga={manga} chapters={chapters} />

      {/* Chapters and Related Manga Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapters Section */}
        <section className="lg:col-span-3">
          {loadingStates.chapters ? (
            <AnimatedChapterListSkeleton />
          ) : (
            <MangaChapterList
              mangaSlug={manga.slug}
              chapters={chapters}
            />
          )}
        </section>

        {/* Related Manga Section */}
        <section className="lg:col-span-1">
          {loadingStates.relatedManga ? (
            <AnimatedRelatedMangaSkeleton />
          ) : (
            <RelatedManga relatedManga={relatedManga} />
          )}
        </section>
      </div>

      {/* Comments Section */}
      <section className="mt-8">
        {loadingStates.comments ? (
          <CommentSectionSkeleton />
        ) : (
          <CommentSectionLazy
            mangaId={manga.id}
            mangaSlug={manga.slug}
            defaultViewMode="all"
            hideToggle={true}
            paginationType="cursor"
          />
        )}
      </section>
    </div>
  );
}

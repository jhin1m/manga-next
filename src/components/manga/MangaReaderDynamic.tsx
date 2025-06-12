'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
// Removed loading overlay - using instant navigation

// Loading component for manga reader
const MangaReaderLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <p className="text-sm font-medium text-white/70 text-center">
        Loading chapter...
      </p>
    </div>
  </div>
);

// Dynamic import with code splitting
const MangaReaderRefactored = dynamic(
  () => import('./MangaReaderRefactored'),
  {
    loading: () => <MangaReaderLoading />,
    ssr: false, // Disable SSR for better performance
  }
);

interface MangaReaderDynamicProps {
  chapterData: {
    manga: {
      id: string;
      title: string;
      slug: string;
      cover_image_url: string;
    };
    chapter: {
      id: string;
      number: number;
      title: string;
      slug?: string;
      images: string[];
    };
    navigation: {
      prevChapter: string | null;
      nextChapter: string | null;
      totalChapters: number;
    };
    chapters?: Array<{
      id: string;
      number: number;
      title?: string;
      slug?: string;
    }>;
  };
}

/**
 * Dynamic wrapper for MangaReader with code splitting
 * This reduces the initial bundle size by loading the reader only when needed
 */
export default function MangaReaderDynamic(props: MangaReaderDynamicProps) {
  return (
    <Suspense fallback={<MangaReaderLoading />}>
      <MangaReaderRefactored {...props} />
    </Suspense>
  );
}

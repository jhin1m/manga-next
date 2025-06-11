'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Custom loading component for manga reader
const MangaReaderSkeleton = () => (
  <div className="min-h-screen bg-black">
    {/* Navigation skeleton */}
    <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm p-2 border-b">
      <div className="flex items-center gap-1 justify-center md:container md:mx-auto">
        <div className="h-9 w-9 bg-gray-300 rounded animate-pulse" />
        <div className="h-9 w-9 bg-gray-300 rounded animate-pulse" />
        <div className="h-9 w-9 bg-gray-300 rounded animate-pulse" />
        <div className="flex-1 h-9 bg-gray-300 rounded animate-pulse max-w-[250px]" />
        <div className="h-9 w-9 bg-gray-300 rounded animate-pulse" />
        <div className="h-9 w-9 bg-gray-300 rounded animate-pulse" />
        <div className="h-9 w-9 bg-gray-300 rounded animate-pulse" />
      </div>
    </div>

    {/* Reader content skeleton */}
    <main className="pt-2 pb-16">
      <div className="flex flex-col items-center w-full sm:max-w-5xl sm:mx-auto space-y-2">
        {/* Image placeholders */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="w-full bg-gray-900/30 animate-pulse"
            style={{ height: '800px' }}
          >
            <div className="flex items-center justify-center h-full">
              {/* Loading SVG Icon */}
              <svg 
                className="h-8 w-8 text-white/50 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </main>

    {/* Bottom controls skeleton */}
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 z-50">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="h-8 w-20 bg-gray-300 rounded animate-pulse" />
        <div className="flex-1 mx-4">
          <div className="h-4 bg-gray-300 rounded animate-pulse mb-1" />
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full w-1/3" />
          </div>
        </div>
        <div className="h-8 w-20 bg-gray-300 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

// Dynamic import with code splitting
const MangaReaderRefactored = dynamic(
  () => import('./MangaReaderRefactored'),
  {
    loading: () => <MangaReaderSkeleton />,
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
    <Suspense fallback={<MangaReaderSkeleton />}>
      <MangaReaderRefactored {...props} />
    </Suspense>
  );
}

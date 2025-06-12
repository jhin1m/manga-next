'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
// Removed loading overlay - using instant navigation

// Lazy load the heavy CommentSection component
const CommentSection = lazy(() => import('./CommentSection'));

interface CommentSectionLazyProps {
  mangaId?: number;
  chapterId?: number;
  mangaSlug?: string;
  chapterSlug?: string;
  initialCommentsCount?: number;
  defaultViewMode?: 'chapter' | 'all';
  hideToggle?: boolean;
  paginationType?: 'offset' | 'cursor';
  delayMs?: number; // Optional delay before showing the component
}

// Loading component for CommentSection
function CommentSectionLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span>Loading comments...</span>
      </div>
    </div>
  );
}

export default function CommentSectionLazy({ delayMs = 0, ...props }: CommentSectionLazyProps) {
  const [shouldRender, setShouldRender] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs > 0) {
      const timer = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[CommentSectionLazy] Rendering after delay:', delayMs + 'ms');
        }
        setShouldRender(true);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (!shouldRender) {
    return <CommentSectionLoading />;
  }

  return (
    <Suspense fallback={<CommentSectionLoading />}>
      <CommentSection {...props} />
    </Suspense>
  );
}

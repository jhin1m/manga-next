'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

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

// Loading skeleton for CommentSection
function CommentSectionSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="hidden sm:flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Comment Form Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Comments List Skeleton */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-4 mt-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
    return <CommentSectionSkeleton />;
  }

  return (
    <Suspense fallback={<CommentSectionSkeleton />}>
      <CommentSection {...props} />
    </Suspense>
  );
}

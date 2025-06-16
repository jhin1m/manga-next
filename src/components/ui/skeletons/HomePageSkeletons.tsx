'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton component for Hot Manga Slider
 */
export function HotMangaSliderSkeleton() {
  return (
    <div className='relative w-full overflow-hidden rounded-lg'>
      <div className='flex items-center justify-between mb-4'>
        <Skeleton className='h-8 w-32' />
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-9 rounded-md' />
          <Skeleton className='h-9 w-9 rounded-md' />
        </div>
      </div>

      <div className='flex gap-4 overflow-hidden'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(20%-16px)] 2xl:w-[calc(16.666%-16px)]'
          >
            <div className='space-y-3'>
              <Skeleton className='aspect-[3/4] w-full rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-3 w-3/4' />
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-3 w-12' />
                  <Skeleton className='h-3 w-16' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton component for Latest Update Manga List
 */
export function LatestUpdateMangaListSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-40' />
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className='space-y-3'>
            <Skeleton className='aspect-[3/4] w-full rounded-lg' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-3 w-3/4' />
              <div className='flex items-center gap-2'>
                <Skeleton className='h-3 w-12' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton component for Sidebar Rankings
 */
export function SidebarRankingsSkeleton() {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-24' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex items-center gap-3'>
              <Skeleton className='h-8 w-8 rounded' />
              <Skeleton className='h-12 w-9 rounded' />
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton component for Recent Comments
 */
export function RecentCommentsSkeleton() {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-32' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-6 w-6 rounded-full' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-3 w-12' />
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton component for Recommended Manga
 */
export function RecommendedMangaSkeleton() {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-5' />
          <Skeleton className='h-6 w-32' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex gap-3'>
              <Skeleton className='h-16 w-12 rounded' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-3 w-16' />
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-3 w-12' />
                  <Skeleton className='h-3 w-8' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Complete Sidebar Skeleton
 */
export function SidebarSkeleton() {
  return (
    <aside className='space-y-6 lg:block'>
      <SidebarRankingsSkeleton />
      <RecentCommentsSkeleton />
      <RecommendedMangaSkeleton />
    </aside>
  );
}

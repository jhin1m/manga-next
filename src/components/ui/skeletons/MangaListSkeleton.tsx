"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function FilterSortBarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      {/* Sort dropdown skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Status filter skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Genre filter skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Search input skeleton */}
      <div className="flex-1">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function MangaCardSkeleton({ index = 0, showAnimation = true }: { index?: number; showAnimation?: boolean }) {
  return (
    <Card className="group border-0 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Cover Image Skeleton - Fixed height to prevent layout shift */}
        <div className="relative overflow-hidden rounded-t-lg">
          <Skeleton className="w-full aspect-[2/3] object-cover" />
        </div>

        {/* Card content skeleton - Simplified to reduce height */}
        <div className="p-3 space-y-2">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Latest chapter skeleton */}
          <Skeleton className="h-3 w-2/3" />

          {/* Rating and views skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MangaGridSkeleton({
  itemCount = 12, // Reduced from 24 to prevent excessive height
  showStaggered = false // Disabled staggered animation to prevent layout shifts
}: {
  itemCount?: number;
  showStaggered?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
      {Array.from({ length: itemCount }).map((_, i) => (
        <MangaCardSkeleton
          key={i}
          index={0}
          showAnimation={false}
        />
      ))}
    </div>
  );
}

export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous button */}
      <Skeleton className="h-10 w-20" />
      
      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-10" />
        ))}
      </div>
      
      {/* Next button */}
      <Skeleton className="h-10 w-20" />
    </div>
  );
}

export function MangaListPageSkeleton() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const steps = [
      { delay: 0, step: 0 },     // Header
      { delay: 200, step: 1 },   // Filter bar
      { delay: 400, step: 2 },   // Manga grid
      { delay: 800, step: 3 },   // Pagination
    ];

    const timeouts = steps.map(({ delay, step }) =>
      setTimeout(() => setCurrentStep(step), delay)
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="container mx-auto py-8">
      {/* Page title skeleton */}
      <div className={`mb-6 transition-all duration-500 ${
        currentStep >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Filter bar skeleton */}
      <div className={`mb-6 transition-all duration-500 delay-200 ${
        currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <FilterSortBarSkeleton />
      </div>

      {/* Manga grid skeleton */}
      <div className={`transition-all duration-500 delay-400 ${
        currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <MangaGridSkeleton showStaggered={currentStep >= 2} />
      </div>

      {/* Pagination skeleton */}
      <div className={`transition-all duration-500 delay-800 ${
        currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <PaginationSkeleton />
      </div>
    </div>
  );
}

// Compact version for faster loading - prevents scroll issues
export function MangaListPageSkeletonCompact() {
  return (
    <div className="container mx-auto py-8">
      {/* Page title skeleton */}
      <Skeleton className="h-8 w-64 mb-6" />

      {/* Filter bar skeleton */}
      <div className="mb-6">
        <FilterSortBarSkeleton />
      </div>

      {/* Manga grid skeleton - conservative height to prevent layout shifts */}
      <MangaGridSkeleton itemCount={8} showStaggered={false} />

      {/* Pagination skeleton */}
      <PaginationSkeleton />
    </div>
  );
}

// Minimal skeleton that matches actual content height more closely
export function MangaGridSkeletonMinimal({
  itemCount = 6
}: {
  itemCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          {/* Just the cover image skeleton */}
          <Skeleton className="w-full aspect-[2/3]" />
          {/* Title skeleton */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

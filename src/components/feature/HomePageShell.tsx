'use client';

import { 
  HotMangaSliderSkeleton, 
  LatestUpdateMangaListSkeleton, 
  SidebarSkeleton 
} from '@/components/ui/skeletons/HomePageSkeletons';
import ViewMoreButton from '@/components/ui/ViewMoreButton';

/**
 * Homepage Shell Component
 * 
 * Renders the static layout structure immediately while data loads in background.
 * This provides instant visual feedback to users and eliminates perceived loading time.
 * 
 * Features:
 * - Instant rendering of page structure
 * - Skeleton placeholders for dynamic content
 * - Maintains exact layout dimensions to prevent layout shifts
 * - Optimized for Core Web Vitals (LCP, CLS)
 */
export default function HomePageShell() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hot Manga Slider Skeleton */}
      <HotMangaSliderSkeleton />

      {/* Main Content + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content Section */}
        <section className="space-y-6">
          {/* Latest Update Manga List Skeleton */}
          <LatestUpdateMangaListSkeleton />

          {/* View More Button - Static, always visible */}
          <ViewMoreButton href="/manga?page=2" />
        </section>

        {/* Sidebar Skeleton */}
        <SidebarSkeleton />
      </div>
    </div>
  );
}

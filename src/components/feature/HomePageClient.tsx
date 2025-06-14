"use client";

import { useEffect, useState } from 'react';
import HotMangaSliderClient from './HotMangaSliderClient';
import LatestUpdateMangaListClient from './LatestUpdateMangaListClient';
import SidebarClient from './SidebarClient';
import ViewMoreButton from '@/components/ui/ViewMoreButton';
import HomePageShell from './HomePageShell';
import { useHomePageData, HomePageData } from '@/hooks/useHomeData';

interface HomePageClientProps {
  initialData?: HomePageData;
  useShellMode?: boolean;
  currentPage?: number;
}

/**
 * Enhanced Homepage Client Component with Shell UI Support
 *
 * Two modes:
 * 1. Traditional mode: Receives server-side data as props (backward compatibility)
 * 2. Shell mode: Shows instant shell UI while loading data asynchronously
 *
 * Shell mode provides:
 * - Instant visual feedback with skeleton placeholders
 * - Background data loading for smooth UX
 * - Optimized Core Web Vitals (LCP, CLS)
 * - Eliminates perceived loading time
 */
export default function HomePageClient({
  initialData,
  useShellMode = false,
  currentPage = 1
}: HomePageClientProps) {
  const [isShellVisible, setIsShellVisible] = useState(useShellMode);

  // Only use the hook when in shell mode
  const { data: asyncData, isLoading, error } = useHomePageData(
    useShellMode ? currentPage : 0 // Pass 0 to disable hook when not in shell mode
  );

  // Determine which data to use
  const data = useShellMode ? asyncData : initialData;

  // Hide shell when data is loaded
  useEffect(() => {
    if (useShellMode && asyncData && !isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsShellVisible(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [useShellMode, asyncData, isLoading]);

  // Show shell while loading in shell mode
  if (useShellMode && isShellVisible && (!data || isLoading)) {
    return <HomePageShell />;
  }

  // Show error state if data failed to load
  if (useShellMode && error && !data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Failed to load homepage data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no data available
  if (!data) {
    return useShellMode ? <HomePageShell /> : null;
  }

  // Render actual content
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hot Manga Slider */}
      <HotMangaSliderClient hotManga={data.hotManga} />

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content */}
        <section className="space-y-6">
          {/* Latest Update Manga List */}
          <LatestUpdateMangaListClient manga={data.latestManga} />

          {/* View More Button */}
          <ViewMoreButton href="/manga?page=2" />
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 lg:block">
          <SidebarClient sidebarData={data.sidebarData} />
        </aside>
      </div>
    </div>
  );
}

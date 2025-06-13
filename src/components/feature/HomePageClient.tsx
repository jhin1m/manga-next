"use client";

import HotMangaSliderClient from './HotMangaSliderClient';
import LatestUpdateMangaListClient from './LatestUpdateMangaListClient';
import SidebarClient from './SidebarClient';
import ViewMoreButton from '@/components/ui/ViewMoreButton';

interface HomePageClientProps {
  initialData: {
    hotManga: any[];
    latestManga: any[];
    latestMangaPagination: {
      totalPages: number;
      currentPage: number;
      totalResults: number;
    };
    sidebarData: {
      rankings: any[];
      recentComments: any[];
      recommendedManga: any[];
    };
  };
}

/**
 * Simplified Homepage Client Component
 * 
 * Simple pattern like MangaDetailClient:
 * - Receives server-side data as props
 * - Renders content immediately without complex optimizations
 * - No background refresh, prefetching, or client-side caching
 */
export default function HomePageClient({ initialData }: HomePageClientProps) {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hot Manga Slider */}
      <HotMangaSliderClient hotManga={initialData.hotManga} />

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content */}
        <section className="space-y-6">
          {/* Latest Update Manga List */}
          <LatestUpdateMangaListClient manga={initialData.latestManga} />

          {/* View More Button */}
          <ViewMoreButton href="/manga?page=2" />
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 lg:block">
          <SidebarClient sidebarData={initialData.sidebarData} />
        </aside>
      </div>
    </div>
  );
}

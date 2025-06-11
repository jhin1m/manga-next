"use client";

import HotMangaSliderClient from './HotMangaSliderClient';
import LatestUpdateMangaListClient from './LatestUpdateMangaListClient';
import SidebarClient from './SidebarClient';
import ViewMoreButton from '@/components/ui/ViewMoreButton';

interface ProgressiveHomePageProps {
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

export default function ProgressiveHomePage({ initialData }: ProgressiveHomePageProps) {
  // Remove fake loading states - render content immediately when data is available
  const data = initialData;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hot Manga Slider - Direct render */}
      <HotMangaSliderClient hotManga={data.hotManga} />

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content */}
        <section className="space-y-6">
          {/* Latest Update Manga List - Direct render */}
          <LatestUpdateMangaListClient manga={data.latestManga} />

          {/* View More Button */}
          <ViewMoreButton href="/manga?page=2" />
        </section>

        {/* Sidebar - Direct render */}
        <aside className="space-y-6 lg:block">
          <SidebarClient sidebarData={data.sidebarData} />
        </aside>
      </div>
    </div>
  );
}

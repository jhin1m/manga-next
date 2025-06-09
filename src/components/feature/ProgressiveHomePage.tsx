"use client";

import { useState, useEffect } from 'react';
import HotMangaSliderClient from './HotMangaSliderClient';
import LatestUpdateMangaListClient from './LatestUpdateMangaListClient';
import SidebarClient from './SidebarClient';
import ViewMoreButton from '@/components/ui/ViewMoreButton';
import { 
  HotMangaSliderSkeleton, 
  LatestMangaListSkeleton, 
  SidebarSkeleton 
} from '@/components/ui/skeletons/HomePageSkeleton';

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
  const [loadingStates, setLoadingStates] = useState({
    hotManga: false,
    latestManga: false,
    sidebar: false,
  });

  const [data, setData] = useState(initialData);

  // Progressive loading effect
  useEffect(() => {
    // Simulate progressive loading for better UX
    const timeouts = [
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, hotManga: false }));
      }, 100),
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, latestManga: false }));
      }, 200),
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, sidebar: false }));
      }, 300),
    ];

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hot Manga Slider */}
      {loadingStates.hotManga ? (
        <HotMangaSliderSkeleton />
      ) : (
        <HotMangaSliderClient hotManga={data.hotManga} />
      )}

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content */}
        <section className="space-y-6">
          {/* Latest Update Manga List */}
          {loadingStates.latestManga ? (
            <LatestMangaListSkeleton limit={24} />
          ) : (
            <LatestUpdateMangaListClient manga={data.latestManga} />
          )}

          {/* View More Button */}
          <ViewMoreButton href="/manga?page=2" />
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 lg:block">
          {loadingStates.sidebar ? (
            <SidebarSkeleton />
          ) : (
            <SidebarClient sidebarData={data.sidebarData} />
          )}
        </aside>
      </div>
    </div>
  );
}

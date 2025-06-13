'use client';

import { useEffect, useState } from 'react';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { useHomepageData } from '@/hooks/useHomepageData';
import { homepageCacheHelpers } from '@/lib/cache/hybrid-cache';
import ProgressiveHomePage from './ProgressiveHomePage';
import HomePageSkeleton from '@/components/ui/HomePageSkeleton';

interface HomePageOptimizedProps {
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
  page?: number;
}

/**
 * Optimized Homepage Component with Hybrid Approach
 *
 * Strategy:
 * 1. Show cached data instantly if available
 * 2. Display static skeleton while loading if no cache
 * 3. Use SWR for background revalidation
 * 4. Implement progressive enhancement
 * 5. Preload adjacent pages for instant navigation
 */
export default function HomePageOptimized({ initialData, page = 1 }: HomePageOptimizedProps) {
  const { hideLoading } = useNavigationLoading();

  // Check if we have cached data for instant display
  const cachedData = homepageCacheHelpers.getHomepageData(page);
  const hasInstantData = !!(cachedData || initialData);

  // Use SWR hook for data management
  const {
    data: swrData,
    isLoading,
    isValidating,
    isCached,
    hasData,
  } = useHomepageData({
    page,
    fallbackData: initialData,
    enableBackground: true,
  });

  // Determine what data to show
  const displayData = swrData || cachedData || initialData;
  const [showSkeleton, setShowSkeleton] = useState(!hasInstantData);

  // Hide loading overlay when we have data to show
  useEffect(() => {
    if (hasInstantData || hasData) {
      hideLoading();
      setShowSkeleton(false);
    }
  }, [hideLoading, hasInstantData, hasData]);

  // Handle skeleton display timing
  useEffect(() => {
    if (!hasInstantData && isLoading) {
      // Show skeleton for a brief moment, then show content
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 300); // Show skeleton for 300ms max

      return () => clearTimeout(timer);
    }
  }, [hasInstantData, isLoading]);

  // Prefetch critical pages for instant navigation
  useEffect(() => {
    const prefetchCriticalPages = () => {
      const criticalUrls = [
        '/manga',
        '/search',
        '/rankings',
      ];

      // Prefetch after initial render to not block homepage loading
      setTimeout(() => {
        criticalUrls.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          document.head.appendChild(link);
        });
      }, 1000);
    };

    prefetchCriticalPages();
  }, []);

  // Show skeleton if no instant data available
  if (showSkeleton && !displayData) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="relative">
      {/* Show refresh indicator when updating in background */}
      {isValidating && displayData && (
        <div className="fixed top-4 right-4 z-50 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm animate-pulse">
          {isCached ? 'Updating...' : 'Loading...'}
        </div>
      )}

      {/* Main content - show immediately if we have data */}
      {displayData && (
        <ProgressiveHomePage initialData={displayData} />
      )}

      {/* Fallback skeleton if still loading */}
      {!displayData && !showSkeleton && (
        <HomePageSkeleton />
      )}
    </div>
  );
}

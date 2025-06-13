'use client';

import { useEffect, useState } from 'react';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import ProgressiveHomePage from './ProgressiveHomePage';

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
}

/**
 * Optimized Homepage Component with Hybrid ISR + Client-side optimization
 * 
 * Strategy:
 * 1. Show initial SSR data immediately (no loading delay)
 * 2. Prefetch critical data in background
 * 3. Use optimistic updates for better UX
 * 4. Implement smart caching for instant navigation
 */
export default function HomePageOptimized({ initialData }: HomePageOptimizedProps) {
  const { hideLoading } = useNavigationLoading();
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hide loading overlay when component mounts (data is ready)
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      hideLoading();
    }, 100);

    return () => clearTimeout(timer);
  }, [hideLoading]);

  // Background data refresh for real-time updates
  useEffect(() => {
    // Only refresh if user is active and page is visible
    const refreshData = async () => {
      if (document.hidden) return;

      try {
        setIsRefreshing(true);

        // Fetch fresh data in background without blocking UI
        const response = await fetch('/api/home', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const freshData = await response.json();

          // Only update if data actually changed to prevent unnecessary re-renders
          if (JSON.stringify(freshData) !== JSON.stringify(data)) {
            setData(freshData);
          }
        }
      } catch (error) {
        console.error('Background refresh failed:', error);
        // Fail silently - keep showing cached data
      } finally {
        setIsRefreshing(false);
      }
    };

    // Refresh every 5 minutes when page is active
    const refreshInterval = setInterval(refreshData, 5 * 60 * 1000);

    // Refresh when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [data]);

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

  return (
    <div className="relative">
      {/* Show refresh indicator when updating in background */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm animate-pulse">
          Updating...
        </div>
      )}
      
      {/* Main content - always show immediately */}
      <ProgressiveHomePage initialData={data} />
    </div>
  );
}

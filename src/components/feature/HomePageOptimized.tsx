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
 * Optimized Homepage Component with Smart Background Refresh
 *
 * Strategy:
 * 1. Show initial SSR data immediately (no loading delay)
 * 2. Skip background API calls on fresh navigation (prevents slow loading)
 * 3. Only trigger background refresh after user interaction
 * 4. Prefetch critical pages for instant navigation
 * 5. Use optimistic updates for better UX
 */
export default function HomePageOptimized({ initialData }: HomePageOptimizedProps) {
  const { hideLoading } = useNavigationLoading();
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hide loading overlay when component mounts (data is ready)
  useEffect(() => {
    // Hide immediately - data is already available from SSR
    hideLoading();
  }, [hideLoading]);

  // Smart background data refresh - only after user interaction
  useEffect(() => {
    let hasUserInteracted = false;
    let refreshInterval: NodeJS.Timeout | null = null;
    let visibilityChangeHandler: (() => void) | null = null;

    // Background refresh function
    const refreshData = async () => {
      if (document.hidden) return;

      try {
        setIsRefreshing(true);

        // Fetch fresh data in background without blocking UI
        const response = await fetch('/api/home', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'x-background-refresh': 'true', // Mark as background refresh
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

    // Setup background refresh only after user interaction
    const setupBackgroundRefresh = () => {
      if (hasUserInteracted) return;

      hasUserInteracted = true;

      // Start periodic refresh (every 5 minutes)
      refreshInterval = setInterval(refreshData, 5 * 60 * 1000);

      // Refresh when page becomes visible again
      visibilityChangeHandler = () => {
        if (!document.hidden) {
          refreshData();
        }
      };
      document.addEventListener('visibilitychange', visibilityChangeHandler);

      // Do initial background refresh after interaction
      setTimeout(refreshData, 2000); // Small delay to not interfere with user action
    };

    // User interaction handlers
    const handleUserInteraction = () => {
      setupBackgroundRefresh();
    };

    // Listen for various user interactions
    const interactionEvents = ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'];

    // Add interaction listeners with passive option for better performance
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, {
        passive: true,
        once: false // Allow multiple interactions but setupBackgroundRefresh will only run once
      });
    });

    // Cleanup function
    return () => {
      // Clear interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Remove visibility change listener
      if (visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
      }

      // Remove interaction listeners
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [data]);

  // Prefetch critical pages for instant navigation (delayed to not block initial render)
  useEffect(() => {
    const prefetchCriticalPages = () => {
      const criticalUrls = [
        '/manga',
        '/search',
        '/rankings',
      ];

      // Prefetch after initial render to not block homepage loading
      // Increased delay to ensure homepage loads fast first
      setTimeout(() => {
        criticalUrls.forEach(url => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          document.head.appendChild(link);
        });
      }, 3000); // Increased from 1s to 3s to prioritize homepage loading
    };

    prefetchCriticalPages();
  }, []);

  return (
    <div className="relative">
      {/* Show refresh indicator when updating in background */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm animate-pulse">
          🔄 Updating...
        </div>
      )}

      {/* Main content - always show immediately with SSR data */}
      <ProgressiveHomePage initialData={data} />
    </div>
  );
}

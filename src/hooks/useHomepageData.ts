'use client';

import useSWR from 'swr';
import { useCallback, useEffect } from 'react';
import { hybridCache, homepageCacheHelpers, HOMEPAGE_CACHE_KEYS } from '@/lib/cache/hybrid-cache';
import { pageSWRConfigs } from '@/lib/swr-instant-config';

// Types
interface HomepageData {
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
}

interface UseHomepageDataOptions {
  page?: number;
  fallbackData?: HomepageData;
  enableBackground?: boolean;
}

/**
 * Fetcher function for homepage data
 */
const fetchHomepageData = async (url: string): Promise<HomepageData> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch homepage data: ${response.status}`);
  }

  return response.json();
};

/**
 * Custom hook for homepage data with hybrid caching strategy
 */
export function useHomepageData(options: UseHomepageDataOptions = {}) {
  const {
    page = 1,
    fallbackData,
    enableBackground = true,
  } = options;

  // Generate cache key and API URL
  const cacheKey = HOMEPAGE_CACHE_KEYS.FULL_DATA(page);
  const apiUrl = `/api/home?page=${page}`;

  // Get cached data as fallback
  const cachedData = homepageCacheHelpers.getHomepageData(page);
  const initialData = fallbackData || cachedData;

  // SWR configuration with homepage-specific settings
  const swrConfig = {
    ...pageSWRConfigs.homepage,
    fallbackData: initialData,
    onSuccess: (data: HomepageData) => {
      // Cache successful responses
      homepageCacheHelpers.setHomepageData(page, data);
    },
    onError: (error: Error) => {
      console.error('[useHomepageData] Fetch error:', error);
    },
    // Use cached data while revalidating
    keepPreviousData: true,
    // Don't revalidate if we have fresh cached data
    revalidateIfStale: !homepageCacheHelpers.hasHomepageData(page),
  };

  // Use SWR for data fetching
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<HomepageData>(
    enableBackground ? apiUrl : null,
    fetchHomepageData,
    swrConfig
  );

  // Preload adjacent pages for better navigation
  useEffect(() => {
    if (data && enableBackground) {
      // Preload next page
      if (data.latestMangaPagination.currentPage < data.latestMangaPagination.totalPages) {
        const nextPage = page + 1;
        if (!homepageCacheHelpers.hasHomepageData(nextPage)) {
          homepageCacheHelpers.preloadHomepageData(nextPage, () =>
            fetchHomepageData(`/api/home?page=${nextPage}`)
          );
        }
      }

      // Preload previous page
      if (page > 1) {
        const prevPage = page - 1;
        if (!homepageCacheHelpers.hasHomepageData(prevPage)) {
          homepageCacheHelpers.preloadHomepageData(prevPage, () =>
            fetchHomepageData(`/api/home?page=${prevPage}`)
          );
        }
      }
    }
  }, [data, page, enableBackground]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      // Clear cache for this page
      hybridCache.delete(cacheKey);
      // Trigger revalidation
      await mutate();
    } catch (error) {
      console.error('[useHomepageData] Refresh failed:', error);
    }
  }, [cacheKey, mutate]);

  // Prefetch function for other pages
  const prefetch = useCallback((targetPage: number) => {
    if (!homepageCacheHelpers.hasHomepageData(targetPage)) {
      homepageCacheHelpers.preloadHomepageData(targetPage, () =>
        fetchHomepageData(`/api/home?page=${targetPage}`)
      );
    }
  }, []);

  return {
    // Data
    data: data || initialData,
    error,
    
    // Loading states
    isLoading: isLoading && !initialData, // Don't show loading if we have cached data
    isValidating,
    isRefreshing: isValidating && !!data,
    
    // Cache status
    isCached: !!cachedData,
    hasData: !!(data || initialData),
    
    // Actions
    refresh,
    prefetch,
    mutate,
  };
}

/**
 * Hook for preloading homepage data
 */
export function useHomepagePreloader() {
  const preloadPage = useCallback((page: number = 1) => {
    if (!homepageCacheHelpers.hasHomepageData(page)) {
      homepageCacheHelpers.preloadHomepageData(page, () =>
        fetchHomepageData(`/api/home?page=${page}`)
      );
    }
  }, []);

  const preloadMultiplePages = useCallback((pages: number[]) => {
    pages.forEach(page => preloadPage(page));
  }, [preloadPage]);

  const clearCache = useCallback(() => {
    homepageCacheHelpers.clearHomepageCache();
  }, []);

  return {
    preloadPage,
    preloadMultiplePages,
    clearCache,
    cacheStats: homepageCacheHelpers.getStats(),
  };
}

/**
 * Hook for instant homepage navigation
 */
export function useInstantHomepage() {
  const { preloadPage } = useHomepagePreloader();

  // Preload homepage on mount
  useEffect(() => {
    preloadPage(1);
  }, [preloadPage]);

  const navigateToHomepage = useCallback(() => {
    // Ensure homepage data is cached before navigation
    preloadPage(1);
    
    // Small delay to ensure cache is ready
    setTimeout(() => {
      window.location.href = '/';
    }, 50);
  }, [preloadPage]);

  const isHomepageCached = homepageCacheHelpers.hasHomepageData(1);

  return {
    navigateToHomepage,
    isHomepageCached,
    preloadHomepage: () => preloadPage(1),
  };
}

// Export types
export type { HomepageData, UseHomepageDataOptions };

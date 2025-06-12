import { SWRConfiguration } from 'swr';

/**
 * Instant Navigation SWR Configuration
 * Optimized for instant page loading with aggressive caching
 */
export const instantSWRConfig: SWRConfiguration = {
  // Cache for 5 minutes before considering stale
  dedupingInterval: 300000, // 5 minutes
  
  // Keep data fresh for 10 minutes
  focusThrottleInterval: 600000, // 10 minutes
  
  // Don't revalidate on focus/reconnect for instant feel
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  
  // Revalidate in background every 30 minutes
  refreshInterval: 1800000, // 30 minutes
  
  // Keep trying on error but with exponential backoff
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Optimistic updates
  revalidateIfStale: true,
  
  // Cache provider for better memory management
  provider: () => new Map(),
  
  // Fallback data while loading
  fallbackData: undefined,
  
  // Suspense mode for better loading states
  suspense: false,
  
  // Keep previous data while revalidating
  keepPreviousData: true,
};

/**
 * Page-specific SWR configurations
 */
export const pageSWRConfigs = {
  // Homepage data - cache aggressively
  homepage: {
    ...instantSWRConfig,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 3600000, // 1 hour
  },
  
  // Manga list - moderate caching
  mangaList: {
    ...instantSWRConfig,
    dedupingInterval: 300000, // 5 minutes
    refreshInterval: 1800000, // 30 minutes
  },
  
  // Manga detail - cache for instant navigation
  mangaDetail: {
    ...instantSWRConfig,
    dedupingInterval: 600000, // 10 minutes
    refreshInterval: 3600000, // 1 hour
  },
  
  // Chapter content - cache heavily (rarely changes)
  chapterContent: {
    ...instantSWRConfig,
    dedupingInterval: 3600000, // 1 hour
    refreshInterval: 86400000, // 24 hours
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  },
  
  // Search results - shorter cache
  search: {
    ...instantSWRConfig,
    dedupingInterval: 60000, // 1 minute
    refreshInterval: 300000, // 5 minutes
  },
  
  // User data - immediate updates
  userData: {
    ...instantSWRConfig,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: true,
  },
};

/**
 * Preload data for instant navigation
 */
export function preloadData(key: string, fetcher: () => Promise<any>) {
  // Use SWR's mutate to preload data
  import('swr').then(({ mutate }) => {
    mutate(key, fetcher(), false);
  });
}

/**
 * Batch preload multiple pages
 */
export function batchPreload(items: Array<{ key: string; fetcher: () => Promise<any> }>) {
  items.forEach(({ key, fetcher }) => {
    preloadData(key, fetcher);
  });
}

/**
 * Clear cache for specific patterns
 */
export function clearCache(pattern?: string) {
  import('swr').then(({ mutate }) => {
    if (pattern) {
      // Clear specific pattern using mutate with filter function
      mutate(
        key => typeof key === 'string' && key.includes(pattern),
        undefined,
        { revalidate: false }
      );
    } else {
      // Clear all cache using mutate with filter function that matches all keys
      mutate(
        () => true,
        undefined,
        { revalidate: false }
      );
    }
  });
}

/**
 * Get cache statistics
 * Note: SWR doesn't provide direct cache access, so this is a simplified version
 */
export function getCacheStats() {
  // Since SWR doesn't expose cache directly, we return a placeholder
  // In a real implementation, you might want to track cache keys manually
  return Promise.resolve({
    totalKeys: 0,
    keys: [],
    memoryUsage: 0,
    note: 'SWR cache statistics not directly accessible'
  });
}

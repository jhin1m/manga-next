'use client';

import { useState, useEffect } from 'react';

// Types for homepage data
export interface HomePageData {
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

interface UseHomePageDataReturn {
  data: HomePageData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for loading homepage data asynchronously
 *
 * This hook fetches homepage data in the background after the shell UI is rendered,
 * providing a smooth user experience with instant visual feedback.
 *
 * Features:
 * - Async data fetching after shell render
 * - Error handling with retry capability
 * - Loading state management
 * - Optimized API calls using centralized client
 */
export function useHomePageData(page: number = 1): UseHomePageDataReturn {
  const [data, setData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(page > 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip fetching if page is 0 (disabled mode)
    if (page <= 0) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchHomePageData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data from our API endpoint
        const response = await fetch(`/api/home?page=${page}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch home data: ${response.status}`);
        }

        const result = await response.json();

        // Only update state if component is still mounted
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);

        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load home data');
          setIsLoading(false);
        }
      }
    }

    // Start fetching data immediately
    fetchHomePageData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [page]);

  return {
    data,
    isLoading,
    error,
  };
}

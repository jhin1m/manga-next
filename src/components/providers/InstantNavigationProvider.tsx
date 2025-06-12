'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrefetch } from '@/components/optimization/SmartPrefetch';

interface InstantNavigationProviderProps {
  children: React.ReactNode;
}

/**
 * Instant Navigation Provider
 * Handles global prefetching and instant navigation optimizations
 */
export default function InstantNavigationProvider({ 
  children 
}: InstantNavigationProviderProps) {
  const router = useRouter();
  const { prefetchMultiple } = usePrefetch();

  useEffect(() => {
    // Prefetch critical pages on app load
    const criticalPages = [
      '/manga',
      '/search',
      '/rankings',
    ];

    // Delay prefetch to not block initial render
    const timer = setTimeout(() => {
      prefetchMultiple(criticalPages);
    }, 1000);

    return () => clearTimeout(timer);
  }, [prefetchMultiple]);

  useEffect(() => {
    // Simple cursor management for navigation feedback
    const handleRouteStart = () => {
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'wait';
      }
    };

    const handleRouteEnd = () => {
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'default';
      }
    };

    // Store original push method
    const originalPush = router.push.bind(router);

    // Enhanced router.push with feedback
    const enhancedPush = (...args: Parameters<typeof router.push>) => {
      handleRouteStart();
      // Reset cursor after a short delay since router.push doesn't return Promise
      const timeoutId = setTimeout(handleRouteEnd, 150);

      try {
        const result = originalPush(...args);
        // Clear timeout if navigation is instant
        setTimeout(() => {
          clearTimeout(timeoutId);
          handleRouteEnd();
        }, 50);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        handleRouteEnd();
        throw error;
      }
    };

    // Replace router.push
    router.push = enhancedPush;

    return () => {
      // Cleanup
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'default';
      }
      // Restore original push method
      router.push = originalPush;
    };
  }, [router]);

  return <>{children}</>;
}

/**
 * Hook for instant navigation
 */
export function useInstantNavigation() {
  const router = useRouter();
  const { prefetch } = usePrefetch();

  const navigateInstantly = (href: string) => {
    try {
      // Prefetch if not already cached
      prefetch(href);

      // Navigate immediately
      router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if router fails
      if (typeof window !== 'undefined') {
        window.location.href = href;
      }
    }
  };

  return { navigateInstantly, prefetch };
}

/**
 * Component for prefetching manga data
 */
interface MangaDataPrefetchProps {
  mangaList?: Array<{ slug: string }>;
}

export function MangaDataPrefetch({ mangaList = [] }: MangaDataPrefetchProps) {
  const { prefetchMultiple } = usePrefetch();

  useEffect(() => {
    if (mangaList.length > 0) {
      // Prefetch manga detail pages
      const mangaUrls = mangaList.slice(0, 20).map(manga => `/manga/${manga.slug}`);
      prefetchMultiple(mangaUrls);
    }
  }, [mangaList, prefetchMultiple]);

  return null;
}

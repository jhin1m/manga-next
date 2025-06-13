'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useHomepagePreloader } from '@/hooks/useHomepageData';

/**
 * Homepage Preloader Component
 * Preloads homepage data when user is on other pages for instant navigation
 */
export default function HomepagePreloader() {
  const pathname = usePathname();
  const { preloadPage, cacheStats } = useHomepagePreloader();

  useEffect(() => {
    // Only preload if not already on homepage
    if (pathname !== '/') {
      // Preload homepage data after a short delay to not interfere with current page
      const timer = setTimeout(() => {
        preloadPage(1);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [pathname, preloadPage]);

  // Preload on user interaction hints
  useEffect(() => {
    const handleMouseMove = () => {
      // Preload on first mouse movement (user is active)
      if (pathname !== '/') {
        preloadPage(1);
      }
      // Remove listener after first trigger
      document.removeEventListener('mousemove', handleMouseMove);
    };

    const handleKeyDown = () => {
      // Preload on first key press (user is active)
      if (pathname !== '/') {
        preloadPage(1);
      }
      // Remove listener after first trigger
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Add listeners with passive option for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true, once: true });
    document.addEventListener('keydown', handleKeyDown, { passive: true, once: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pathname, preloadPage]);

  // Debug info in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[HomepagePreloader] Cache stats:', cacheStats);
    }
  }, [cacheStats]);

  // This component doesn't render anything
  return null;
}

/**
 * Enhanced Homepage Preloader with more aggressive strategies
 */
export function AggressiveHomepagePreloader() {
  const pathname = usePathname();
  const { preloadPage, preloadMultiplePages } = useHomepagePreloader();

  useEffect(() => {
    if (pathname !== '/') {
      // Immediate preload for critical pages
      preloadPage(1);
      
      // Preload multiple pages after delay
      setTimeout(() => {
        preloadMultiplePages([1, 2]);
      }, 5000);
    }
  }, [pathname, preloadPage, preloadMultiplePages]);

  // Preload on scroll (user is engaged)
  useEffect(() => {
    let hasPreloaded = false;

    const handleScroll = () => {
      if (!hasPreloaded && pathname !== '/') {
        preloadPage(1);
        hasPreloaded = true;
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, preloadPage]);

  // Preload on visibility change (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && pathname !== '/') {
        preloadPage(1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname, preloadPage]);

  return null;
}

/**
 * Smart Homepage Preloader with adaptive behavior
 */
export function SmartHomepagePreloader() {
  const pathname = usePathname();
  const { preloadPage } = useHomepagePreloader();

  useEffect(() => {
    // Don't preload if already on homepage
    if (pathname === '/') return;

    // Check connection quality
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      connection.saveData
    );

    // Skip preloading on slow connections
    if (isSlowConnection) {
      console.log('[SmartHomepagePreloader] Skipping preload due to slow connection');
      return;
    }

    // Adaptive preload timing based on page type
    let delay = 1000; // Default 1 second

    if (pathname.startsWith('/manga/')) {
      // User reading manga, likely to go home after
      delay = 3000; // 3 seconds
    } else if (pathname.startsWith('/search')) {
      // User searching, might go home
      delay = 2000; // 2 seconds
    } else if (pathname.startsWith('/profile')) {
      // User in profile, less likely to go home immediately
      delay = 5000; // 5 seconds
    }

    const timer = setTimeout(() => {
      preloadPage(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, preloadPage]);

  return null;
}

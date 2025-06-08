/**
 * Back/Forward Cache (BFCache) Utilities
 * 
 * This module provides utilities to optimize and handle Back/Forward Cache
 * for better user experience and performance in NextJS applications.
 * 
 * BFCache allows browsers to cache entire pages in memory for instant
 * back/forward navigation without re-executing JavaScript or re-rendering.
 */

export interface BFCacheEvent {
  type: 'pageshow' | 'pagehide';
  persisted: boolean;
  timeStamp: number;
}

export interface BFCacheOptions {
  onPageShow?: (event: BFCacheEvent) => void;
  onPageHide?: (event: BFCacheEvent) => void;
  onBFCacheRestore?: () => void;
  onBFCacheStore?: () => void;
  enableLogging?: boolean;
}

/**
 * Check if the current browser supports BFCache
 */
export function isBFCacheSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for pageshow/pagehide events support
  return 'onpageshow' in window && 'onpagehide' in window;
}

/**
 * Check if the page was restored from BFCache
 */
export function isRestoredFromBFCache(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if navigation type indicates back/forward
  if ('navigation' in window && 'type' in (window as any).navigation) {
    return (window as any).navigation.type === 'back_forward';
  }

  // Fallback: check performance navigation type (deprecated but still supported)
  try {
    if ('performance' in window && (window.performance as any).navigation) {
      return (window.performance as any).navigation.type === 2; // TYPE_BACK_FORWARD
    }
  } catch (e) {
    // Ignore deprecated API errors
  }
  
  return false;
}

/**
 * Get BFCache eligibility status and reasons
 */
export function getBFCacheEligibility(): {
  eligible: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  if (typeof window === 'undefined') {
    return { eligible: false, reasons: ['Server-side rendering'] };
  }
  
  // Check for common BFCache blockers
  
  // 1. Unload event listeners (deprecated but still checked for compatibility)
  try {
    if ((window as any).onunload || (window as any).onbeforeunload) {
      reasons.push('Unload/beforeunload event listeners detected');
    }
  } catch (e) {
    // Ignore deprecated API errors
  }
  
  // 2. Open connections (WebSocket, EventSource, etc.)
  // Note: This is a simplified check
  if ((window as any).WebSocket && (window as any).EventSource) {
    // In a real implementation, you'd track active connections
    // reasons.push('Active WebSocket or EventSource connections');
  }
  
  // 3. Cache-Control headers that prevent caching
  // This would be checked server-side
  
  // 4. HTTPS requirement
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    reasons.push('Page not served over HTTPS');
  }
  
  return {
    eligible: reasons.length === 0,
    reasons
  };
}

/**
 * Initialize BFCache handling with event listeners
 */
export function initBFCache(options: BFCacheOptions = {}): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }
  
  const { 
    onPageShow, 
    onPageHide, 
    onBFCacheRestore, 
    onBFCacheStore,
    enableLogging = false 
  } = options;
  
  const log = enableLogging ? console.log : () => {};
  
  // PageShow event handler
  const handlePageShow = (event: PageTransitionEvent) => {
    const bfcacheEvent: BFCacheEvent = {
      type: 'pageshow',
      persisted: event.persisted,
      timeStamp: event.timeStamp
    };
    
    if (event.persisted) {
      log('🔄 Page restored from BFCache');
      onBFCacheRestore?.();
    } else {
      log('📄 Page loaded normally');
    }
    
    onPageShow?.(bfcacheEvent);
  };
  
  // PageHide event handler
  const handlePageHide = (event: PageTransitionEvent) => {
    const bfcacheEvent: BFCacheEvent = {
      type: 'pagehide',
      persisted: event.persisted,
      timeStamp: event.timeStamp
    };
    
    if (event.persisted) {
      log('💾 Page stored in BFCache');
      onBFCacheStore?.();
    } else {
      log('🗑️ Page unloaded (not cached)');
    }
    
    onPageHide?.(bfcacheEvent);
  };
  
  // Add event listeners
  window.addEventListener('pageshow', handlePageShow);
  window.addEventListener('pagehide', handlePageHide);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('pagehide', handlePageHide);
  };
}

/**
 * Optimize current page for BFCache eligibility
 */
export function optimizeForBFCache(): void {
  if (typeof window === 'undefined') return;
  
  // Remove unload event listeners that block BFCache (deprecated but still needed for compatibility)
  try {
    (window as any).onunload = null;
    (window as any).onbeforeunload = null;
  } catch (e) {
    // Ignore deprecated API errors
  }
  
  // Clean up any timers or intervals that might prevent caching
  // Note: This is a basic implementation - you might need more specific cleanup
  
  // Ensure no active fetch requests when page is hidden
  const originalFetch = window.fetch;
  const activeFetches = new Set<AbortController>();
  
  window.fetch = async function(...args) {
    const controller = new AbortController();
    activeFetches.add(controller);

    const [input, init = {}] = args;
    const enhancedInit = {
      ...init,
      signal: controller.signal
    };

    try {
      return await originalFetch(input, enhancedInit);
    } finally {
      activeFetches.delete(controller);
    }
  };
  
  // Abort active fetches when page is hidden
  window.addEventListener('pagehide', () => {
    activeFetches.forEach(controller => {
      controller.abort();
    });
    activeFetches.clear();
  });
}

/**
 * Preload critical resources for better BFCache performance
 */
export function preloadCriticalResources(resources: string[]): void {
  if (typeof window === 'undefined') return;
  
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type based on extension
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image';
    } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Monitor BFCache performance and report metrics
 */
export function monitorBFCachePerformance(): void {
  if (typeof window === 'undefined') return;
  
  let navigationStart = performance.now();
  
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const restoreTime = performance.now() - navigationStart;
      
      // Report BFCache restore performance
      if ('gtag' in window) {
        (window as any).gtag('event', 'bfcache_restore', {
          custom_parameter_1: restoreTime,
          event_category: 'performance'
        });
      }
      
      console.log(`🚀 BFCache restore took ${restoreTime.toFixed(2)}ms`);
    }
  });
  
  window.addEventListener('pagehide', () => {
    navigationStart = performance.now();
  });
}

/**
 * Default BFCache configuration for the application
 */
export const defaultBFCacheConfig: BFCacheOptions = {
  enableLogging: process.env.NODE_ENV === 'development',
  onBFCacheRestore: () => {
    // Refresh any time-sensitive data
    // Trigger any necessary re-renders
    // Update user interface state
  },
  onBFCacheStore: () => {
    // Clean up any resources
    // Save current state if needed
  }
};

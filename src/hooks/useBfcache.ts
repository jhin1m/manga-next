/**
 * React Hook for Back/Forward Cache (BFCache) Management
 * 
 * This hook provides React integration for BFCache functionality,
 * allowing components to respond to BFCache events and optimize
 * their behavior accordingly.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  initBFCache, 
  isBFCacheSupported, 
  isRestoredFromBFCache, 
  getBFCacheEligibility,
  optimizeForBFCache,
  type BFCacheEvent,
  type BFCacheOptions 
} from '@/lib/cache/bfcache';

export interface UseBFCacheOptions extends BFCacheOptions {
  /**
   * Whether to automatically optimize the page for BFCache
   */
  autoOptimize?: boolean;
  
  /**
   * Whether to refresh data when restored from BFCache
   */
  refreshOnRestore?: boolean;
  
  /**
   * Callback to refresh data
   */
  onDataRefresh?: () => void | Promise<void>;
}

export interface BFCacheState {
  /**
   * Whether BFCache is supported in the current browser
   */
  isSupported: boolean;
  
  /**
   * Whether the current page was restored from BFCache
   */
  isRestored: boolean;
  
  /**
   * Whether the page is eligible for BFCache
   */
  isEligible: boolean;
  
  /**
   * Reasons why the page might not be eligible for BFCache
   */
  eligibilityReasons: string[];
  
  /**
   * The last BFCache event that occurred
   */
  lastEvent: BFCacheEvent | null;
  
  /**
   * Whether the page is currently visible (not hidden)
   */
  isVisible: boolean;
}

/**
 * React hook for managing Back/Forward Cache functionality
 */
export function useBFCache(options: UseBFCacheOptions = {}): BFCacheState {
  const {
    autoOptimize = true,
    refreshOnRestore = true,
    onDataRefresh,
    onPageShow,
    onPageHide,
    onBFCacheRestore,
    onBFCacheStore,
    enableLogging = process.env.NODE_ENV === 'development'
  } = options;

  // State management
  const [state, setState] = useState<BFCacheState>({
    isSupported: false,
    isRestored: false,
    isEligible: false,
    eligibilityReasons: [],
    lastEvent: null,
    isVisible: true
  });

  // Refs to track cleanup and prevent stale closures
  const cleanupRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Enhanced page show handler
  const handlePageShow = useCallback((event: BFCacheEvent) => {
    setState(prev => ({
      ...prev,
      lastEvent: event,
      isVisible: true,
      isRestored: event.persisted
    }));

    // Call original handler
    onPageShow?.(event);

    // Handle BFCache restore
    if (event.persisted) {
      onBFCacheRestore?.();
      
      // Refresh data if requested
      if (refreshOnRestore && onDataRefresh) {
        onDataRefresh();
      }
    }
  }, [onPageShow, onBFCacheRestore, refreshOnRestore, onDataRefresh]);

  // Enhanced page hide handler
  const handlePageHide = useCallback((event: BFCacheEvent) => {
    setState(prev => ({
      ...prev,
      lastEvent: event,
      isVisible: false
    }));

    // Call original handler
    onPageHide?.(event);

    // Handle BFCache store
    if (event.persisted) {
      onBFCacheStore?.();
    }
  }, [onPageHide, onBFCacheStore]);

  // Visibility change handler
  const handleVisibilityChange = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: !document.hidden
    }));
  }, []);

  // Initialize BFCache functionality
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) {
      return;
    }

    isInitializedRef.current = true;

    // Check initial state
    const supported = isBFCacheSupported();
    const restored = isRestoredFromBFCache();
    const eligibility = getBFCacheEligibility();

    setState(prev => ({
      ...prev,
      isSupported: supported,
      isRestored: restored,
      isEligible: eligibility.eligible,
      eligibilityReasons: eligibility.reasons,
      isVisible: !document.hidden
    }));

    // Auto-optimize if requested
    if (autoOptimize) {
      optimizeForBFCache();
    }

    // Initialize BFCache event handling
    const cleanup = initBFCache({
      onPageShow: handlePageShow,
      onPageHide: handlePageHide,
      onBFCacheRestore,
      onBFCacheStore,
      enableLogging
    });

    cleanupRef.current = cleanup;

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupRef.current = null;
      isInitializedRef.current = false;
    };
  }, [
    autoOptimize,
    handlePageShow,
    handlePageHide,
    handleVisibilityChange,
    onBFCacheRestore,
    onBFCacheStore,
    enableLogging
  ]);

  return state;
}

/**
 * Hook for components that need to refresh data when restored from BFCache
 */
export function useBFCacheDataRefresh(
  refreshFn: () => void | Promise<void>,
  dependencies: React.DependencyList = []
): BFCacheState {
  const dataRefreshCallback = useCallback(refreshFn, dependencies);
  
  return useBFCache({
    refreshOnRestore: true,
    onDataRefresh: dataRefreshCallback,
    enableLogging: process.env.NODE_ENV === 'development'
  });
}

/**
 * Hook for monitoring BFCache performance
 */
export function useBFCachePerformance(): {
  restoreTime: number | null;
  storeTime: number | null;
} {
  const [restoreTime, setRestoreTime] = useState<number | null>(null);
  const [storeTime, setStoreTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useBFCache({
    onPageShow: (event) => {
      if (event.persisted) {
        const time = performance.now() - startTimeRef.current;
        setRestoreTime(time);
      }
    },
    onPageHide: (event) => {
      startTimeRef.current = performance.now();
      if (event.persisted) {
        const time = performance.now() - startTimeRef.current;
        setStoreTime(time);
      }
    }
  });

  return { restoreTime, storeTime };
}

/**
 * Hook for components that need to clean up resources before BFCache
 */
export function useBFCacheCleanup(
  cleanupFn: () => void,
  dependencies: React.DependencyList = []
): void {
  const cleanupCallback = useCallback(cleanupFn, dependencies);
  
  useBFCache({
    onBFCacheStore: cleanupCallback
  });
}

/**
 * Hook to check if the current page is BFCache eligible
 */
export function useBFCacheEligibility(): {
  isEligible: boolean;
  reasons: string[];
  refresh: () => void;
} {
  const [eligibility, setEligibility] = useState({
    isEligible: false,
    reasons: [] as string[]
  });

  const refresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      const result = getBFCacheEligibility();
      setEligibility(result);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...eligibility,
    refresh
  };
}

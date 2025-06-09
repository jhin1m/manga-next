'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationProgressState {
  isLoading: boolean;
  progress: number;
}

/**
 * Custom hook to manage navigation loading progress
 * Provides smooth loading animations during page transitions
 */
export function useNavigationProgress() {
  const [state, setState] = useState<NavigationProgressState>({
    isLoading: false,
    progress: 0,
  });
  
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const previousPathnameRef = useRef<string>(pathname);

  // Start loading animation
  const startLoading = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    startTimeRef.current = Date.now();
    setState({ isLoading: true, progress: 0 });

    // Simulate progress with realistic timing
    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      
      // Progress curve: fast start, then slower
      if (elapsed < 200) {
        currentProgress = Math.min(30, (elapsed / 200) * 30);
      } else if (elapsed < 500) {
        currentProgress = Math.min(60, 30 + ((elapsed - 200) / 300) * 30);
      } else if (elapsed < 1000) {
        currentProgress = Math.min(85, 60 + ((elapsed - 500) / 500) * 25);
      } else {
        // Slow down significantly after 1 second
        currentProgress = Math.min(95, 85 + ((elapsed - 1000) / 2000) * 10);
      }

      setState(prev => ({ ...prev, progress: currentProgress }));
    }, 16); // ~60fps
  };

  // Complete loading animation
  const completeLoading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setState(prev => ({ ...prev, progress: 100 }));

    // Hide progress bar after animation completes
    timeoutRef.current = setTimeout(() => {
      setState({ isLoading: false, progress: 0 });
    }, 200);
  };

  // Monitor pathname changes for navigation detection
  useEffect(() => {
    const currentPathname = pathname;
    const previousPathname = previousPathnameRef.current;

    // Only trigger loading if pathname actually changed
    if (currentPathname !== previousPathname) {
      // Start loading when navigation begins
      startLoading();
      
      // Complete loading after a short delay to ensure smooth transition
      const completeTimeout = setTimeout(() => {
        completeLoading();
      }, 100);

      previousPathnameRef.current = currentPathname;

      return () => {
        clearTimeout(completeTimeout);
      };
    }
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isLoading: state.isLoading,
    progress: state.progress,
    startLoading,
    completeLoading,
  };
}

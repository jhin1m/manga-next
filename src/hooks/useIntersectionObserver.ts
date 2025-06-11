'use client';

import { useRef, useCallback, useEffect } from 'react';

interface UseIntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
  root?: Element | null;
}

interface UseIntersectionObserverReturn {
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
  observe: (element: Element) => void;
  unobserve: (element: Element) => void;
  disconnect: () => void;
}

/**
 * Custom hook for managing IntersectionObserver
 * Provides a reusable intersection observer with cleanup
 */
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    rootMargin = '0px',
    threshold = 0.1,
    root = null,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin,
      threshold,
      root,
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, rootMargin, threshold, root]);

  // Observe element
  const observe = useCallback((element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  // Unobserve element
  const unobserve = useCallback((element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  }, []);

  // Disconnect observer
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  return {
    observerRef,
    observe,
    unobserve,
    disconnect,
  };
}

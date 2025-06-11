'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageLoadState {
  loaded: boolean;
  loading: boolean;
  error: boolean;
  inView: boolean;
}

interface UseImageLoadingOptions {
  preloadCount?: number;
  maxSimultaneousLoads?: number;
  triggerDistance?: number;
}

interface UseImageLoadingReturn {
  imageStates: Record<number, ImageLoadState>;
  loadingQueue: Set<number>;
  loadImage: (index: number, src: string) => void;
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
  imageRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  loadedImagesRef: React.MutableRefObject<Set<number>>;
}

/**
 * Custom hook for managing image lazy loading in manga reader
 * Handles intersection observer, loading states, and preloading logic
 */
export function useImageLoading(
  images: string[],
  options: UseImageLoadingOptions = {}
): UseImageLoadingReturn {
  const {
    preloadCount = 3,
    maxSimultaneousLoads = 3,
    triggerDistance = 200,
  } = options;

  // State for tracking image loading states
  const [imageStates, setImageStates] = useState<Record<number, ImageLoadState>>({});
  const [loadingQueue, setLoadingQueue] = useState<Set<number>>(new Set());

  // Refs for managing observers and loaded images
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Record<number, HTMLElement | null>>({});
  const loadedImagesRef = useRef<Set<number>>(new Set());

  // Initialize image states
  useEffect(() => {
    const initialStates: Record<number, ImageLoadState> = {};
    images.forEach((_, index) => {
      initialStates[index] = {
        loaded: index < preloadCount, // Preload first images
        loading: index < preloadCount,
        error: false,
        inView: false
      };
    });
    setImageStates(initialStates);
  }, [images, preloadCount]);

  // Load image function
  const loadImage = useCallback((index: number, src: string) => {
    if (loadedImagesRef.current.has(index) || loadingQueue.size >= maxSimultaneousLoads) {
      return;
    }

    setLoadingQueue(prev => new Set([...prev, index]));
    setImageStates(prev => ({
      ...prev,
      [index]: { ...prev[index], loading: true, error: false }
    }));

    const img = new Image();
    img.onload = () => {
      loadedImagesRef.current.add(index);
      setImageStates(prev => ({
        ...prev,
        [index]: { ...prev[index], loaded: true, loading: false }
      }));
      setLoadingQueue(prev => {
        const newQueue = new Set(prev);
        newQueue.delete(index);
        return newQueue;
      });
    };

    img.onerror = () => {
      setImageStates(prev => ({
        ...prev,
        [index]: { ...prev[index], loading: false, error: true }
      }));
      setLoadingQueue(prev => {
        const newQueue = new Set(prev);
        newQueue.delete(index);
        return newQueue;
      });
    };

    img.src = src;
  }, [loadingQueue.size, maxSimultaneousLoads]);

  // Setup intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          const isIntersecting = entry.isIntersecting;

          setImageStates(prev => ({
            ...prev,
            [index]: { ...prev[index], inView: isIntersecting }
          }));

          if (isIntersecting && !loadedImagesRef.current.has(index)) {
            const src = images[index];
            if (src) {
              loadImage(index, src);
            }
          }
        });
      },
      {
        rootMargin: `${triggerDistance}px`,
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [images, loadImage, triggerDistance]);

  // Observe image containers
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    Object.values(imageRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(imageRefs.current).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [imageStates]);

  // Preload first images
  useEffect(() => {
    images.slice(0, preloadCount).forEach((src, index) => {
      loadImage(index, src);
    });
  }, [images, preloadCount, loadImage]);

  return {
    imageStates,
    loadingQueue,
    loadImage,
    observerRef,
    imageRefs,
    loadedImagesRef,
  };
}

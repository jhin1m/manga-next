'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseReaderProgressOptions {
  totalImages: number;
  syncInterval?: number; // Minimum time between sync calls (in ms)
}

interface UseReaderProgressReturn {
  currentPage: number;
  readingProgress: number;
  updateProgress: (page: number) => void;
  syncProgress: () => void;
}

/**
 * Custom hook for managing reading progress in manga reader
 * Handles progress tracking and syncing with minimal API calls
 */
export function useReaderProgress(
  mangaId: string,
  chapterId: string,
  options: UseReaderProgressOptions
): UseReaderProgressReturn {
  const { totalImages, syncInterval = 3600000 } = options; // Default: 1 hour

  const [currentPage, setCurrentPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Refs for managing sync timing
  const lastSyncTime = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate reading progress percentage
  const calculateProgress = useCallback((page: number) => {
    return Math.round((page / totalImages) * 100);
  }, [totalImages]);

  // Update progress function
  const updateProgress = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalImages));
    setCurrentPage(clampedPage);
    
    const progress = calculateProgress(clampedPage);
    setReadingProgress(progress);

    // Store progress in localStorage immediately
    try {
      const progressData = {
        mangaId,
        chapterId,
        currentPage: clampedPage,
        progress,
        timestamp: Date.now(),
      };
      localStorage.setItem(`reading-progress-${mangaId}-${chapterId}`, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Failed to save reading progress to localStorage:', error);
    }

    // Debounce API sync to prevent excessive calls
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncProgress();
    }, 2000); // Sync after 2 seconds of inactivity
  }, [mangaId, chapterId, totalImages, calculateProgress]);

  // Sync progress to server (with rate limiting)
  const syncProgress = useCallback(async () => {
    const now = Date.now();
    
    // Rate limit: only sync once per hour maximum
    if (now - lastSyncTime.current < syncInterval) {
      return;
    }

    try {
      const response = await fetch('/api/reading-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comicId: parseInt(mangaId),
          chapterId: parseInt(chapterId),
          currentPage,
          progress: readingProgress,
        }),
      });

      if (response.ok) {
        lastSyncTime.current = now;
      }
    } catch (error) {
      // Silently fail - progress is still saved locally
      console.warn('Failed to sync reading progress:', error);
    }
  }, [mangaId, chapterId, currentPage, readingProgress, syncInterval]);

  // Load initial progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reading-progress-${mangaId}-${chapterId}`);
      if (stored) {
        const progressData = JSON.parse(stored);
        setCurrentPage(progressData.currentPage || 1);
        setReadingProgress(progressData.progress || 0);
      }
    } catch (error) {
      console.warn('Failed to load reading progress from localStorage:', error);
    }
  }, [mangaId, chapterId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Auto-sync on page visibility change (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncProgress]);

  return {
    currentPage,
    readingProgress,
    updateProgress,
    syncProgress,
  };
}

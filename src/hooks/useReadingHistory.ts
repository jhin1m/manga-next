"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { addToReadingHistory } from "@/lib/utils/readingHistory";
import { readingProgressApi } from "@/lib/api/client";

type UseReadingHistoryProps = {
  mangaId: string;
  mangaTitle: string;
  mangaSlug: string;
  coverImage: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  chapterSlug?: string;
};

/**
 * Hook to automatically track reading history
 * Use this in manga chapter pages to automatically add to reading history
 * Supports both localStorage and database sync for authenticated users
 */
export function useReadingHistory({
  mangaId,
  mangaTitle,
  mangaSlug,
  coverImage,
  chapterId,
  chapterTitle,
  chapterNumber,
  chapterSlug,
}: UseReadingHistoryProps) {
  const { data: session, status } = useSession();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate a unique ID for this history item
    const id = `${mangaId}${chapterId ? `-${chapterId}` : ''}-${Date.now()}`;

    // Create history item
    const historyItem = {
      id,
      manga: {
        id: mangaId,
        title: mangaTitle,
        slug: mangaSlug,
        coverImage,
      },
      ...(chapterId && chapterNumber && chapterSlug
        ? {
            chapter: {
              id: chapterId,
              title: chapterTitle || `Chapter ${chapterNumber}`,
              number: chapterNumber,
              slug: chapterSlug,
            },
          }
        : {}),
    };

    // Add to reading history immediately
    addToReadingHistory(historyItem);

    // If user is authenticated, debounce database sync to avoid race conditions
    if (status === 'authenticated' && session?.user) {
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Set a new timeout to sync after a delay
      syncTimeoutRef.current = setTimeout(() => {
        syncToDatabase(mangaId, chapterId);
      }, 1000); // 1 second debounce
    }

    // Cleanup function
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [mangaId, mangaTitle, mangaSlug, coverImage, chapterId, chapterTitle, chapterNumber, chapterSlug, session, status]);

  // Function to sync reading progress to database with improved error handling
  const syncToDatabase = async (comicId: string, chapterId?: string) => {
    try {
      await readingProgressApi.create({
        comicId: parseInt(comicId),
        chapterId: chapterId ? parseInt(chapterId) : undefined,
      });
    } catch (error: any) {
      // Only log errors that aren't expected (like 409 conflicts)
      if (!error.message?.includes('409') && !error.message?.includes('already exists')) {
        console.error('Error syncing reading progress:', error);
      }
    }
  };
}

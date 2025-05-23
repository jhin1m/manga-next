"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { addToReadingHistory } from "@/lib/utils/readingHistory";

type UseReadingHistoryProps = {
  mangaId: string;
  mangaTitle: string;
  mangaSlug: string;
  coverImage: string;
  chapterId?: string;
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
  chapterNumber,
  chapterSlug,
}: UseReadingHistoryProps) {
  const { data: session, status } = useSession();

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
              number: chapterNumber,
              slug: chapterSlug,
            },
          }
        : {}),
    };

    // Add to reading history
    addToReadingHistory(historyItem);

    // If user is authenticated, also sync to database
    if (status === 'authenticated' && session?.user) {
      syncToDatabase(mangaId, chapterId);
    }
  }, [mangaId, mangaTitle, mangaSlug, coverImage, chapterId, chapterNumber, chapterSlug, session, status]);

  // Function to sync reading progress to database
  const syncToDatabase = async (comicId: string, chapterId?: string) => {
    try {
      const response = await fetch('/api/reading-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comicId: parseInt(comicId),
          chapterId: chapterId ? parseInt(chapterId) : undefined,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync reading progress to database');
      }
    } catch (error) {
      console.error('Error syncing reading progress:', error);
    }
  };
}

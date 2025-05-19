"use client";

import { useEffect } from "react";
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
  }, [mangaId, mangaTitle, mangaSlug, coverImage, chapterId, chapterNumber, chapterSlug]);
}

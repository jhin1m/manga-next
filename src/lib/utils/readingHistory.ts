/**
 * Utility functions for managing reading history in localStorage and database
 */

export type ReadingHistory = {
  id: string;
  manga: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
  };
  chapter?: {
    id: string;
    title: string;
    number: number;
    slug: string;
  };
  readAt: string;
};

export type DatabaseReadingProgress = {
  user_id: number;
  comic_id: number;
  last_read_chapter_id?: number;
  last_read_page_number?: number;
  progress_percentage?: number;
  updated_at: string;
  Comics: {
    id: number;
    title: string;
    slug: string;
    cover_image_url: string;
  };
  Chapters?: {
    id: number;
    title: string;
    chapter_number: number;
    slug: string;
  };
};

const STORAGE_KEY = 'manga-reading-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get reading history from localStorage with automatic deduplication
 */
export function getReadingHistory(): ReadingHistory[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY);
    if (!storedHistory) return [];

    const history: ReadingHistory[] = JSON.parse(storedHistory);

    // Deduplicate by manga ID, keeping most recent entry for each manga
    const deduplicatedHistory = deduplicateReadingHistory(history);

    // If deduplication changed the array, save the cleaned version
    if (deduplicatedHistory.length !== history.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicatedHistory));
    }

    return deduplicatedHistory;
  } catch (error) {
    console.error('Failed to get reading history:', error);
    return [];
  }
}

/**
 * Deduplicate reading history by manga ID, keeping most recent entry for each manga
 */
function deduplicateReadingHistory(history: ReadingHistory[]): ReadingHistory[] {
  const mangaMap = new Map<string, ReadingHistory>();

  history.forEach(item => {
    const existing = mangaMap.get(item.manga.id);

    // Keep the most recent entry for this manga
    if (!existing || new Date(item.readAt) > new Date(existing.readAt)) {
      mangaMap.set(item.manga.id, item);
    }
  });

  // Convert back to array and sort by readAt (most recent first)
  return Array.from(mangaMap.values())
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
    .slice(0, MAX_HISTORY_ITEMS);
}

/**
 * Add a manga chapter to reading history
 */
export function addToReadingHistory(historyItem: Omit<ReadingHistory, 'readAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getReadingHistory();

    // Create new history item with current timestamp
    const newItem: ReadingHistory = {
      ...historyItem,
      readAt: new Date().toISOString(),
    };

    // Remove ANY existing entry for the same manga (regardless of chapter)
    // This ensures only one entry per manga is kept, showing the most recent chapter
    const filteredHistory = history.filter(
      item => item.manga.id !== newItem.manga.id
    );

    // Add new item at the beginning
    const updatedHistory = [newItem, ...filteredHistory];

    // Limit the history size
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to add to reading history:', error);
  }
}

/**
 * Clear all reading history
 */
export function clearReadingHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear reading history:', error);
  }
}

/**
 * Remove a specific item from reading history
 */
export function removeFromReadingHistory(itemId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getReadingHistory();
    const updatedHistory = history.filter(item => item.id !== itemId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to remove from reading history:', error);
  }
}

/**
 * Convert database reading progress to localStorage format
 */
export function convertDbToLocalHistory(dbProgress: DatabaseReadingProgress[]): ReadingHistory[] {
  return dbProgress.map(progress => ({
    id: `${progress.comic_id}-${progress.last_read_chapter_id || 'manga'}-${new Date(progress.updated_at).getTime()}`,
    manga: {
      id: progress.comic_id.toString(),
      title: progress.Comics.title,
      slug: progress.Comics.slug,
      coverImage: progress.Comics.cover_image_url || '',
    },
    ...(progress.Chapters ? {
      chapter: {
        id: progress.last_read_chapter_id!.toString(),
        title: progress.Chapters.title || '',
        number: progress.Chapters.chapter_number,
        slug: progress.Chapters.slug,
      }
    } : {}),
    readAt: progress.updated_at,
  }));
}

/**
 * Convert localStorage history to database format
 */
export function convertLocalToDbHistory(localHistory: ReadingHistory[]): Array<{
  comic_id: number;
  last_read_chapter_id?: number;
  updated_at: string;
}> {
  return localHistory.map(item => ({
    comic_id: parseInt(item.manga.id),
    last_read_chapter_id: item.chapter ? parseInt(item.chapter.id) : undefined,
    updated_at: item.readAt,
  }));
}

/**
 * Merge localStorage and database history, keeping most recent entries
 * Only one entry per manga is kept (the most recent chapter)
 */
export function mergeReadingHistory(
  localHistory: ReadingHistory[],
  dbHistory: ReadingHistory[]
): ReadingHistory[] {
  const merged = new Map<string, ReadingHistory>();

  // Add all entries to map, using manga ID as key (not manga-chapter combination)
  // This ensures only one entry per manga is kept
  [...localHistory, ...dbHistory].forEach(item => {
    const key = item.manga.id;
    const existing = merged.get(key);

    // Keep the most recent entry for this manga
    if (!existing || new Date(item.readAt) > new Date(existing.readAt)) {
      merged.set(key, item);
    }
  });

  // Convert back to array and sort by readAt (most recent first)
  return Array.from(merged.values())
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
    .slice(0, MAX_HISTORY_ITEMS);
}

/**
 * Get all items from localStorage (for sync purposes)
 */
export function getUnsyncedHistory(): ReadingHistory[] {
  return getReadingHistory();
}

/**
 * Remove item from both localStorage and database (for authenticated users)
 */
export async function removeFromReadingHistoryComplete(itemId: string, isAuthenticated: boolean = false): Promise<void> {
  // Always remove from localStorage first
  removeFromReadingHistory(itemId);

  // If user is authenticated, also remove from database
  if (isAuthenticated) {
    try {
      // Extract comic ID from the item ID format: "comicId-chapterId-timestamp" or "comicId-manga-timestamp"
      const comicId = itemId.split('-')[0];

      if (comicId && !isNaN(parseInt(comicId))) {
        const response = await fetch(`/api/reading-progress/${comicId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.error('Failed to remove reading progress from database');
        }
      }
    } catch (error) {
      console.error('Error removing reading progress from database:', error);
    }
  }
}

/**
 * Remove item from database by comic ID (for Profile page)
 */
export async function removeFromDatabaseByComicId(comicId: number): Promise<void> {
  try {
    const response = await fetch(`/api/reading-progress/${comicId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Failed to remove reading progress from database');
    }
  } catch (error) {
    console.error('Error removing reading progress from database:', error);
  }
}

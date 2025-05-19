/**
 * Utility functions for managing reading history in localStorage
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
    number: number;
    slug: string;
  };
  readAt: string;
};

const STORAGE_KEY = 'manga-reading-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get reading history from localStorage
 */
export function getReadingHistory(): ReadingHistory[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY);
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error('Failed to get reading history:', error);
    return [];
  }
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
    
    // Remove existing entry for the same manga and chapter if exists
    const filteredHistory = history.filter(
      item => !(item.manga.id === newItem.manga.id && 
               (!item.chapter || !newItem.chapter || item.chapter.id === newItem.chapter.id))
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

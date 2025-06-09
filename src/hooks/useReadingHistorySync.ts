"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ReadingHistory,
  getReadingHistory,
  convertDbToLocalHistory,
  convertLocalToDbHistory,
  mergeReadingHistory,
  getUnsyncedHistory,
} from "@/lib/utils/readingHistory";
import { readingProgressApi } from "@/lib/api/client";

interface SyncStatus {
  isLoading: boolean;
  lastSyncAt?: string;
  error?: string;
  syncedCount?: number;
  skippedCount?: number;
}

// Constants for sync timing
const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const SYNC_STORAGE_KEY = 'manga-last-sync-timestamp';

interface UseReadingHistorySyncReturn {
  history: ReadingHistory[];
  clearDatabaseHistory: () => Promise<void>;
  refreshHistory: () => void;
  forceSync: () => Promise<void>;
  lastSyncTime: number;
}

/**
 * Hook for managing reading history synchronization between localStorage and database
 */
export function useReadingHistorySync(): UseReadingHistorySyncReturn {
  const { status } = useSession();
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isLoading: false });

  // Helper functions for sync timing
  const getLastSyncTime = useCallback(() => {
    try {
      const timestamp = localStorage.getItem(SYNC_STORAGE_KEY);
      return timestamp ? parseInt(timestamp) : 0;
    } catch {
      return 0;
    }
  }, []);

  const setLastSyncTime = useCallback((timestamp: number) => {
    try {
      localStorage.setItem(SYNC_STORAGE_KEY, timestamp.toString());
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const shouldSync = useCallback(() => {
    const lastSyncTime = getLastSyncTime();
    const now = Date.now();
    return (now - lastSyncTime) >= SYNC_COOLDOWN_MS;
  }, [getLastSyncTime]);

  // Load history from localStorage
  const loadLocalHistory = useCallback(() => {
    const localHistory = getReadingHistory();
    setHistory(localHistory);
  }, []);

  // Sync localStorage data to database
  const syncToDatabase = useCallback(async () => {
    if (status !== 'authenticated') {
      throw new Error('User not authenticated');
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const unsyncedItems = getUnsyncedHistory();

      if (unsyncedItems.length === 0) {
        setSyncStatus(prev => ({
          ...prev,
          isLoading: false,
          lastSyncAt: new Date().toISOString(),
          syncedCount: 0,
          skippedCount: 0,
        }));
        return;
      }

      const dbFormatItems = convertLocalToDbHistory(unsyncedItems);

      const result = await readingProgressApi.sync(dbFormatItems);

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date().toISOString(),
        syncedCount: result.syncedCount,
        skippedCount: result.skippedCount,
      }));

      // Update last sync timestamp if items were actually synced
      if (result.syncedCount > 0) {
        setLastSyncTime(Date.now());
      }

    } catch (error: any) {
      // Only log unexpected errors, not conflicts
      if (!error.message?.includes('409') && !error.message?.includes('already exists')) {
        console.error('Error syncing to database:', error);
      }
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [status, setLastSyncTime]);

  // Sync database data to localStorage
  const syncFromDatabase = useCallback(async () => {
    if (status !== 'authenticated') {
      throw new Error('User not authenticated');
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const data = await readingProgressApi.getList();
      const dbHistory = convertDbToLocalHistory(data.progress);
      const localHistory = getReadingHistory();

      // Merge histories, keeping most recent entries
      const mergedHistory = mergeReadingHistory(localHistory, dbHistory);

      // Update localStorage with merged history
      localStorage.setItem('manga-reading-history', JSON.stringify(mergedHistory));
      setHistory(mergedHistory);

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date().toISOString(),
      }));

      // Update last sync timestamp
      setLastSyncTime(Date.now());

    } catch (error: any) {
      // Only log unexpected errors, not conflicts
      if (!error.message?.includes('409') && !error.message?.includes('already exists')) {
        console.error('Error syncing from database:', error);
      }
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [status, setLastSyncTime]);

  // Full bidirectional sync with cooldown check
  const fullSync = useCallback(async (forceSync: boolean = false) => {
    if (status !== 'authenticated') {
      return;
    }

    // Check if we should sync based on cooldown period
    if (!forceSync && !shouldSync()) {
      return;
    }

    try {
      // First sync from database to get latest data
      await syncFromDatabase();
      // Then sync any unsynced local items to database
      await syncToDatabase();

      // Update last sync timestamp
      setLastSyncTime(Date.now());
    } catch (error: any) {
      // Only log unexpected errors, not conflicts
      if (!error.message?.includes('409') && !error.message?.includes('already exists')) {
        console.error('Error during full sync:', error);
      }
    }
  }, [status, syncFromDatabase, syncToDatabase, shouldSync, setLastSyncTime]);

  // Clear all database history
  const clearDatabaseHistory = useCallback(async () => {
    if (status !== 'authenticated') {
      throw new Error('User not authenticated');
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      await readingProgressApi.deleteAll();

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date().toISOString(),
      }));

    } catch (error) {
      console.error('Error clearing database history:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Clear failed',
      }));
    }
  }, [status]);

  // Refresh history from localStorage
  const refreshHistory = useCallback(() => {
    loadLocalHistory();
  }, [loadLocalHistory]);

  // Force sync function for manual sync
  const forceSync = useCallback(async () => {
    await fullSync(true);
  }, [fullSync]);

  // Auto-sync on login with longer delay to avoid conflicts
  useEffect(() => {
    if (status === 'authenticated') {
      // Longer delay to ensure session is fully loaded and avoid race conditions
      const timer = setTimeout(() => {
        fullSync();
      }, 3000); // Increased from 1000ms to 3000ms

      return () => clearTimeout(timer);
    }
  }, [status, fullSync]);

  // Load initial history
  useEffect(() => {
    loadLocalHistory();
  }, [loadLocalHistory]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'manga-reading-history') {
        loadLocalHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadLocalHistory]);

  return {
    history,
    clearDatabaseHistory,
    refreshHistory,
    forceSync,
    lastSyncTime: getLastSyncTime(),
  };
}

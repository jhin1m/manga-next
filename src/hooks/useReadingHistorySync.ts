"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ReadingHistory,
  DatabaseReadingProgress,
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

interface UseReadingHistorySyncReturn {
  history: ReadingHistory[];
  clearDatabaseHistory: () => Promise<void>;
  refreshHistory: () => void;
}

/**
 * Hook for managing reading history synchronization between localStorage and database
 */
export function useReadingHistorySync(): UseReadingHistorySyncReturn {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isLoading: false });

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

    } catch (error) {
      console.error('Error syncing to database:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [status, loadLocalHistory]);

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

    } catch (error) {
      console.error('Error syncing from database:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [status]);

  // Full bidirectional sync
  const fullSync = useCallback(async () => {
    if (status !== 'authenticated') {
      return;
    }

    try {
      // First sync from database to get latest data
      await syncFromDatabase();
      // Then sync any unsynced local items to database
      await syncToDatabase();
    } catch (error) {
      console.error('Error during full sync:', error);
    }
  }, [status, syncFromDatabase, syncToDatabase]);

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

  // Auto-sync on login
  useEffect(() => {
    if (status === 'authenticated') {
      // Delay to ensure session is fully loaded
      const timer = setTimeout(() => {
        fullSync();
      }, 1000);

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
  };
}

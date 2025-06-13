'use client';

import { homeCache, CACHE_KEYS, cacheHelpers } from './home-cache';

// Types
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface HybridCacheOptions {
  ttl?: number;
  useLocalStorage?: boolean;
  version?: string;
}

// Cache configuration
const CACHE_CONFIG = {
  VERSION: '1.0.0',
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  STORAGE_PREFIX: 'manga_cache_',
  MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
};

/**
 * Hybrid Cache Manager
 * Combines memory cache, localStorage, and SWR for optimal performance
 */
class HybridCacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private isClient = typeof window !== 'undefined';

  /**
   * Set data in both memory and localStorage
   */
  set<T>(
    key: string, 
    data: T, 
    options: HybridCacheOptions = {}
  ): void {
    const {
      ttl = CACHE_CONFIG.DEFAULT_TTL,
      useLocalStorage = true,
      version = CACHE_CONFIG.VERSION,
    } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version,
    };

    // Set in memory cache
    this.memoryCache.set(key, entry);

    // Set in localStorage if enabled and on client
    if (useLocalStorage && this.isClient) {
      try {
        const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key;
        localStorage.setItem(storageKey, JSON.stringify(entry));
        this.cleanupStorage();
      } catch (error) {
        console.warn('[HybridCache] localStorage write failed:', error);
      }
    }
  }

  /**
   * Get data from memory cache first, then localStorage
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Try localStorage if on client
    if (this.isClient) {
      try {
        const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (this.isValidEntry(entry)) {
            // Restore to memory cache
            this.memoryCache.set(key, entry);
            return entry.data;
          } else {
            // Remove expired entry
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.warn('[HybridCache] localStorage read failed:', error);
      }
    }

    return null;
  }

  /**
   * Check if entry is valid (not expired and correct version)
   */
  private isValidEntry<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    const isNotExpired = (now - entry.timestamp) < entry.ttl;
    const isCorrectVersion = entry.version === CACHE_CONFIG.VERSION;
    return isNotExpired && isCorrectVersion;
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete entry from both caches
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    
    if (this.isClient) {
      try {
        const storageKey = CACHE_CONFIG.STORAGE_PREFIX + key;
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('[HybridCache] localStorage delete failed:', error);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    
    if (this.isClient) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(CACHE_CONFIG.STORAGE_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('[HybridCache] localStorage clear failed:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let storageSize = 0;
    let storageCount = 0;

    if (this.isClient) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(CACHE_CONFIG.STORAGE_PREFIX)) {
            storageCount++;
            const value = localStorage.getItem(key);
            if (value) {
              storageSize += value.length;
            }
          }
        });
      } catch (error) {
        console.warn('[HybridCache] Stats calculation failed:', error);
      }
    }

    return {
      memory: { count: memorySize },
      storage: { count: storageCount, size: storageSize },
    };
  }

  /**
   * Cleanup expired entries and manage storage size
   */
  private cleanupStorage(): void {
    if (!this.isClient) return;

    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.STORAGE_PREFIX));
      
      // Remove expired entries
      cacheKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const entry = JSON.parse(value);
            if (!this.isValidEntry(entry)) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      });

      // Check storage size and remove oldest entries if needed
      const remainingKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_CONFIG.STORAGE_PREFIX));
      
      let totalSize = 0;
      const entries: Array<{ key: string; timestamp: number; size: number }> = [];

      remainingKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const entry = JSON.parse(value);
            const size = value.length;
            totalSize += size;
            entries.push({ key, timestamp: entry.timestamp, size });
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      });

      // Remove oldest entries if over size limit
      if (totalSize > CACHE_CONFIG.MAX_STORAGE_SIZE) {
        entries.sort((a, b) => a.timestamp - b.timestamp);
        
        while (totalSize > CACHE_CONFIG.MAX_STORAGE_SIZE && entries.length > 0) {
          const oldest = entries.shift();
          if (oldest) {
            localStorage.removeItem(oldest.key);
            totalSize -= oldest.size;
          }
        }
      }
    } catch (error) {
      console.warn('[HybridCache] Cleanup failed:', error);
    }
  }

  /**
   * Preload data for instant navigation
   */
  preload<T>(key: string, fetcher: () => Promise<T>, options?: HybridCacheOptions): void {
    // Only preload if not already cached
    if (!this.has(key)) {
      fetcher()
        .then(data => {
          this.set(key, data, options);
        })
        .catch(error => {
          console.warn(`[HybridCache] Preload failed for ${key}:`, error);
        });
    }
  }
}

// Singleton instance
export const hybridCache = new HybridCacheManager();

// Homepage-specific cache keys
export const HOMEPAGE_CACHE_KEYS = {
  FULL_DATA: (page: number = 1) => `homepage_full_${page}`,
  HOT_MANGA: 'homepage_hot_manga',
  LATEST_MANGA: (page: number = 1) => `homepage_latest_${page}`,
  SIDEBAR_DATA: 'homepage_sidebar',
} as const;

// Homepage cache helpers
export const homepageCacheHelpers = {
  // Set full homepage data
  setHomepageData: (page: number, data: any) => {
    hybridCache.set(HOMEPAGE_CACHE_KEYS.FULL_DATA(page), data, {
      ttl: 5 * 60 * 1000, // 5 minutes
      useLocalStorage: true,
    });
  },

  // Get full homepage data
  getHomepageData: (page: number = 1): any | null => {
    return hybridCache.get(HOMEPAGE_CACHE_KEYS.FULL_DATA(page));
  },

  // Check if homepage data is cached
  hasHomepageData: (page: number = 1): boolean => {
    return hybridCache.has(HOMEPAGE_CACHE_KEYS.FULL_DATA(page));
  },

  // Preload homepage data
  preloadHomepageData: (page: number, fetcher: () => Promise<any>) => {
    hybridCache.preload(HOMEPAGE_CACHE_KEYS.FULL_DATA(page), fetcher);
  },

  // Clear homepage cache
  clearHomepageCache: () => {
    for (let page = 1; page <= 10; page++) {
      hybridCache.delete(HOMEPAGE_CACHE_KEYS.FULL_DATA(page));
    }
    hybridCache.delete(HOMEPAGE_CACHE_KEYS.HOT_MANGA);
    hybridCache.delete(HOMEPAGE_CACHE_KEYS.LATEST_MANGA(1));
    hybridCache.delete(HOMEPAGE_CACHE_KEYS.SIDEBAR_DATA);
  },

  // Get cache stats
  getStats: () => hybridCache.getStats(),
};

// Auto cleanup every 10 minutes on client
if (typeof window !== 'undefined') {
  setInterval(() => {
    hybridCache['cleanupStorage']();
  }, 10 * 60 * 1000);
}

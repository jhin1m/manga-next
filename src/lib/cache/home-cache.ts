/**
 * Home Cache Management
 * Optimized caching strategy for home page data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class HomeCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / (validEntries + expiredEntries) || 0,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Singleton instance
export const homeCache = new HomeCache();

// Cache keys
export const CACHE_KEYS = {
  HOT_MANGA: 'hot-manga',
  LATEST_MANGA: (page: number) => `latest-manga-${page}`,
  SIDEBAR_RANKINGS: 'sidebar-rankings',
  RECENT_COMMENTS: 'recent-comments',
  RECOMMENDED_MANGA: 'recommended-manga',
  FULL_HOME: (page: number) => `home-${page}`,
} as const;

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  HOT_MANGA: 30 * 60 * 1000, // 30 minutes
  LATEST_MANGA: 15 * 60 * 1000, // 15 minutes
  SIDEBAR_RANKINGS: 30 * 60 * 1000, // 30 minutes
  RECENT_COMMENTS: 5 * 60 * 1000, // 5 minutes
  RECOMMENDED_MANGA: 30 * 60 * 1000, // 30 minutes
  FULL_HOME: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Helper functions for common cache operations
 */
export const cacheHelpers = {
  // Cache hot manga data
  setHotManga: (data: any[]) => {
    homeCache.set(CACHE_KEYS.HOT_MANGA, data, CACHE_TTL.HOT_MANGA);
  },

  getHotManga: (): any[] | null => {
    return homeCache.get(CACHE_KEYS.HOT_MANGA);
  },

  // Cache latest manga data
  setLatestManga: (page: number, data: any) => {
    homeCache.set(CACHE_KEYS.LATEST_MANGA(page), data, CACHE_TTL.LATEST_MANGA);
  },

  getLatestManga: (page: number): any | null => {
    return homeCache.get(CACHE_KEYS.LATEST_MANGA(page));
  },

  // Cache sidebar rankings
  setSidebarRankings: (data: any[]) => {
    homeCache.set(CACHE_KEYS.SIDEBAR_RANKINGS, data, CACHE_TTL.SIDEBAR_RANKINGS);
  },

  getSidebarRankings: (): any[] | null => {
    return homeCache.get(CACHE_KEYS.SIDEBAR_RANKINGS);
  },

  // Cache recent comments
  setRecentComments: (data: any[]) => {
    homeCache.set(CACHE_KEYS.RECENT_COMMENTS, data, CACHE_TTL.RECENT_COMMENTS);
  },

  getRecentComments: (): any[] | null => {
    return homeCache.get(CACHE_KEYS.RECENT_COMMENTS);
  },

  // Cache full home data
  setFullHome: (page: number, data: any) => {
    homeCache.set(CACHE_KEYS.FULL_HOME(page), data, CACHE_TTL.FULL_HOME);
  },

  getFullHome: (page: number): any | null => {
    return homeCache.get(CACHE_KEYS.FULL_HOME(page));
  },

  // Invalidate related caches
  invalidateHomeCache: () => {
    homeCache.delete(CACHE_KEYS.HOT_MANGA);
    homeCache.delete(CACHE_KEYS.SIDEBAR_RANKINGS);
    homeCache.delete(CACHE_KEYS.RECENT_COMMENTS);
    homeCache.delete(CACHE_KEYS.RECOMMENDED_MANGA);
    
    // Clear all latest manga pages
    for (let page = 1; page <= 10; page++) {
      homeCache.delete(CACHE_KEYS.LATEST_MANGA(page));
      homeCache.delete(CACHE_KEYS.FULL_HOME(page));
    }
  },
};

// Auto cleanup every 30 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const cleaned = homeCache.cleanup();
    if (cleaned > 0) {
      console.log(`[Home Cache] Cleaned up ${cleaned} expired entries`);
    }
  }, 30 * 60 * 1000);
}

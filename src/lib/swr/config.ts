/**
 * SWR Configuration for Advanced Caching Strategy
 * Provides optimized caching for manga website with smart revalidation
 */

import { SWRConfiguration } from 'swr'

// Custom fetcher that works with our existing API client
export const swrFetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // Attach extra info to the error object
    ;(error as any).info = await response.json()
    ;(error as any).status = response.status
    throw error
  }

  return response.json()
}

// SWR Configuration optimized for manga website
export const swrConfig: SWRConfiguration = {
  // Global fetcher
  fetcher: swrFetcher,

  // Cache configuration
  revalidateOnFocus: false, // Don&apos;t revalidate on window focus (manga reading shouldn't be interrupted)
  revalidateOnReconnect: true, // Revalidate when network reconnects
  revalidateIfStale: true, // Revalidate if data is stale
  
  // Timing configuration
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  focusThrottleInterval: 5000, // Throttle focus revalidation to 5 seconds
  
  // Error handling
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
  
  // Performance optimizations
  keepPreviousData: true, // Keep previous data while loading new data
  
  // Custom revalidation intervals based on data type
  refreshInterval: 0, // Disable automatic refresh by default (we'll set per-hook)
}

// Specific configurations for different data types
export const cacheConfigs = {
  // Manga list - moderate refresh rate
  mangaList: {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    dedupingInterval: 30 * 1000, // 30 seconds
    revalidateIfStale: true,
  },

  // Manga detail - longer cache since it changes less frequently
  mangaDetail: {
    refreshInterval: 10 * 60 * 1000, // 10 minutes
    dedupingInterval: 60 * 1000, // 1 minute
    revalidateIfStale: true,
  },

  // Hot/Popular manga - longer cache since it's expensive to compute
  hotManga: {
    refreshInterval: 30 * 60 * 1000, // 30 minutes
    dedupingInterval: 5 * 60 * 1000, // 5 minutes
    revalidateIfStale: false, // Don&apos;t revalidate stale data automatically
  },

  // Search results - short cache since they're user-specific
  search: {
    refreshInterval: 2 * 60 * 1000, // 2 minutes
    dedupingInterval: 10 * 1000, // 10 seconds
    revalidateIfStale: true,
  },

  // User data - medium refresh rate
  userData: {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    dedupingInterval: 30 * 1000, // 30 seconds
    revalidateIfStale: true,
  },

  // Rankings - longer cache since they're computed periodically
  rankings: {
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    dedupingInterval: 2 * 60 * 1000, // 2 minutes
    revalidateIfStale: true,
  },

  // Comments - shorter cache for real-time feel
  comments: {
    refreshInterval: 1 * 60 * 1000, // 1 minute
    dedupingInterval: 10 * 1000, // 10 seconds
    revalidateIfStale: true,
  },

  // Static data (genres, etc.) - very long cache
  staticData: {
    refreshInterval: 60 * 60 * 1000, // 1 hour
    dedupingInterval: 10 * 60 * 1000, // 10 minutes
    revalidateIfStale: false,
  },
}

// Cache key generators for consistent naming
export const cacheKeys = {
  mangaList: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/manga?${query.toString()}`
  },

  mangaDetail: (slug: string) => `/api/manga/${slug}`,
  
  mangaChapters: (slug: string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/manga/${slug}/chapters?${query.toString()}`
  },

  search: (query: string, params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams({ q: query })
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    return `/api/search?${searchParams.toString()}`
  },

  rankings: (category: string, period: string, params: Record<string, any> = {}) => {
    const query = new URLSearchParams({ category, period })
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/manga/rankings?${query.toString()}`
  },

  userFavorites: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/favorites?${query.toString()}`
  },

  comments: (mangaId: number, params: Record<string, any> = {}) => {
    const query = new URLSearchParams({ comic_id: String(mangaId) })
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/comments?${query.toString()}`
  },

  chapterComments: (chapterId: number, params: Record<string, any> = {}) => {
    const query = new URLSearchParams({ chapter_id: String(chapterId) })
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/comments?${query.toString()}`
  },

  userComments: (userId: number, params: Record<string, any> = {}) => {
    const query = new URLSearchParams({ user_id: String(userId) })
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return `/api/comments?${query.toString()}`
  },

  genres: () => '/api/genres',

  userProfile: () => '/api/users/me',
}

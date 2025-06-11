'use client'

import { mutate } from 'swr'
import { cacheKeys } from './config'

/**
 * SWR Cache Manager for advanced cache invalidation and management
 * Provides utilities to invalidate related caches when data changes
 */

// Cache invalidation patterns
export const cacheManager = {
  // Invalidate all manga-related caches
  invalidateMangaData: async () => {
    // Invalidate all manga list variations
    await mutate(key => typeof key === 'string' && key.includes('/api/manga'), undefined, { revalidate: true })
    
    // Invalidate search results that might contain manga
    await mutate(key => typeof key === 'string' && key.includes('/api/search'), undefined, { revalidate: true })
    
    // Invalidate rankings
    await mutate(key => typeof key === 'string' && key.includes('/api/manga/rankings'), undefined, { revalidate: true })
  },

  // Invalidate specific manga and related data
  invalidateManga: async (slug: string) => {
    // Invalidate specific manga detail
    await mutate(cacheKeys.mangaDetail(slug))
    
    // Invalidate manga chapters
    await mutate(key => typeof key === 'string' && key.includes(`/api/manga/${slug}/chapters`), undefined, { revalidate: true })
    
    // Invalidate manga lists that might contain this manga
    await mutate(key => typeof key === 'string' && key.includes('/api/manga?'), undefined, { revalidate: true })
    
    // Invalidate search results
    await mutate(key => typeof key === 'string' && key.includes('/api/search'), undefined, { revalidate: true })
  },

  // Invalidate user-specific data
  invalidateUserData: async () => {
    // Invalidate user profile
    await mutate(cacheKeys.userProfile())
    
    // Invalidate user favorites
    await mutate(key => typeof key === 'string' && key.includes('/api/favorites'), undefined, { revalidate: true })
    
    // Invalidate user-specific data
    await mutate(key => typeof key === 'string' && key.includes('/api/users/me'), undefined, { revalidate: true })
  },

  // Invalidate search results
  invalidateSearch: async (query?: string) => {
    if (query) {
      // Invalidate specific search query
      await mutate(key => typeof key === 'string' && key.includes(`/api/search?q=${encodeURIComponent(query)}`), undefined, { revalidate: true })
    } else {
      // Invalidate all search results
      await mutate(key => typeof key === 'string' && key.includes('/api/search'), undefined, { revalidate: true })
    }
  },

  // Invalidate rankings
  invalidateRankings: async (category?: string, period?: string) => {
    if (category && period) {
      // Invalidate specific ranking
      await mutate(cacheKeys.rankings(category as any, period as any))
    } else {
      // Invalidate all rankings
      await mutate(key => typeof key === 'string' && key.includes('/api/manga/rankings'), undefined, { revalidate: true })
    }
  },

  // Invalidate comments
  invalidateComments: async (comicId?: number, chapterId?: number) => {
    if (comicId) {
      // Invalidate specific manga comments
      await mutate(key => typeof key === 'string' && key.includes(`/api/comments?comic_id=${comicId}`), undefined, { revalidate: true })
    } else if (chapterId) {
      // Invalidate specific chapter comments
      await mutate(key => typeof key === 'string' && key.includes(`/api/comments?chapter_id=${chapterId}`), undefined, { revalidate: true })
    } else {
      // Invalidate all comments
      await mutate(key => typeof key === 'string' && key.includes('/api/comments'), undefined, { revalidate: true })
    }
  },

  // Optimistic updates for better UX
  optimisticUpdates: {
    // Optimistically update favorite status
    updateFavoriteStatus: async (comicId: number, isFavorite: boolean) => {
      // Update user favorites cache optimistically
      await mutate(
        cacheKeys.userFavorites(),
        (currentData: any) => {
          if (!currentData) return currentData

          if (isFavorite) {
            // Add to favorites (simplified - in practice you'd need full comic data)
            return currentData
          } else {
            // Remove from favorites
            return {
              ...currentData,
              favorites: currentData.favorites?.filter((fav: any) => fav.Comics.id !== comicId) || [],
            }
          }
        },
        false // Don&apos;t revalidate immediately
      )
    },

    // Optimistically update manga views
    updateMangaViews: async (slug: string, increment: number = 1) => {
      await mutate(
        cacheKeys.mangaDetail(slug),
        (currentData: any) => {
          if (!currentData) return currentData

          return {
            ...currentData,
            total_views: (currentData.total_views || 0) + increment,
          }
        },
        false // Don&apos;t revalidate immediately
      )
    },

    // Optimistically update rating
    updateMangaRating: async (slug: string, newRating: number, userRating: number) => {
      await mutate(
        cacheKeys.mangaDetail(slug),
        (currentData: any) => {
          if (!currentData) return currentData

          return {
            ...currentData,
            average_rating: newRating,
            rating_count: (currentData.rating_count || 0) + (userRating > 0 ? 0 : 1), // Only increment if new rating
          }
        },
        false // Don&apos;t revalidate immediately
      )
    },
  },

  // Preload data for better performance
  preload: {
    // Preload popular manga
    popularManga: async () => {
      await mutate(cacheKeys.mangaList({ sort: 'popular', limit: 10 }))
    },

    // Preload trending rankings
    trendingRankings: async () => {
      await mutate(cacheKeys.rankings('trending', 'weekly'))
      await mutate(cacheKeys.rankings('most_viewed', 'daily'))
    },

    // Preload user data (if authenticated)
    userData: async () => {
      await mutate(cacheKeys.userProfile())
      await mutate(cacheKeys.userFavorites())
    },

    // Preload static data
    staticData: async () => {
      await mutate(cacheKeys.genres())
    },
  },

  // Cache statistics and debugging
  debug: {
    // Get cache statistics
    getCacheStats: () => {
      // This would require access to SWR's internal cache
      // For now, return a placeholder
      return {
        totalKeys: 0,
        memoryUsage: 0,
        hitRate: 0,
      }
    },

    // Clear all caches (use with caution)
    clearAllCaches: async () => {
      await mutate(() => true, undefined, { revalidate: false })
    },

    // Log cache keys for debugging
    logCacheKeys: () => {
      console.log('SWR Cache Keys:', {
        mangaList: 'Pattern: /api/manga?*',
        mangaDetail: 'Pattern: /api/manga/[slug]',
        search: 'Pattern: /api/search?*',
        rankings: 'Pattern: /api/manga/rankings?*',
        userFavorites: 'Pattern: /api/favorites?*',
        userProfile: 'Pattern: /api/users/me',
        comments: 'Pattern: /api/comments?*',
        genres: 'Pattern: /api/genres',
      })
    },
  },
}

// Helper function to invalidate caches after mutations
export const invalidateAfterMutation = {
  // After creating/updating manga
  manga: async (slug: string) => {
    await cacheManager.invalidateManga(slug)
    await cacheManager.invalidateRankings()
  },

  // After user actions (favorite, rating, etc.)
  userAction: async (comicSlug?: string) => {
    await cacheManager.invalidateUserData()
    if (comicSlug) {
      await cacheManager.invalidateManga(comicSlug)
    }
  },

  // After comment actions
  comment: async (comicId?: number, chapterId?: number) => {
    await cacheManager.invalidateComments(comicId, chapterId)
  },
}

// Export for use in components and API routes
export default cacheManager

'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { cacheKeys, cacheConfigs } from '@/lib/swr/config'

// Types
interface UserProfile {
  id: number
  username: string
  email: string
  avatar_url: string
  role: string
  created_at: string
  updated_at: string
  Favorites: Array<{
    Comics: {
      id: number
      title: string
      slug: string
      cover_image_url: string
    }
  }>
  Reading_Progress: Array<{
    Comics: {
      id: number
      title: string
      slug: string
      cover_image_url: string
    }
    Chapters: {
      id: number
      title: string
      chapter_number: string
    }
  }>
}

interface FavoritesParams {
  page?: number
  limit?: number
}

interface FavoritesResponse {
  favorites: Array<{
    id: number
    Comics: {
      id: number
      title: string
      slug: string
      cover_image_url: string
      status: string
      genres: Array<{ name: string; slug: string }>
      total_views: number
      average_rating: number
    }
    created_at: string
  }>
  pagination: {
    total: number
    currentPage: number
    totalPages: number
    perPage: number
  }
}

/**
 * Hook for fetching user profile with SWR caching
 */
export function useUserProfile() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const cacheKey = isAuthenticated ? cacheKeys.userProfile() : null

  const { data, isLoading, error, mutate } = useSWR<UserProfile>(
    cacheKey,
    cacheConfigs.userData
  )

  return {
    user: data,
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    mutate,
    isAuthenticated,
  }
}

/**
 * Hook for fetching user favorites with SWR caching
 */
export function useUserFavorites(params: FavoritesParams = {}) {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const cacheKey = isAuthenticated ? cacheKeys.userFavorites(params) : null

  const { data, isLoading, error, mutate } = useSWR<FavoritesResponse>(
    cacheKey,
    cacheConfigs.userData
  )

  return {
    favorites: data?.favorites || [],
    pagination: data?.pagination || {
      total: 0,
      currentPage: 1,
      totalPages: 0,
      perPage: 20,
    },
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    mutate,
    isAuthenticated,
  }
}

/**
 * Hook for checking if a manga is favorited (optimized with SWR)
 */
export function useFavoriteStatus(comicId: number) {
  const { favorites, isLoading, mutate } = useUserFavorites()
  
  const isFavorite = favorites.some(fav => fav.Comics.id === comicId)
  
  // Optimistic update function
  const toggleFavorite = async (newStatus: boolean) => {
    // Optimistically update the cache
    mutate(
      (currentData) => {
        if (!currentData) return currentData
        
        if (newStatus) {
          // Add to favorites (we'd need the full comic data for this)
          // This is a simplified version - in practice, you'd fetch the comic data
          return currentData
        } else {
          // Remove from favorites
          return {
            ...currentData,
            favorites: currentData.favorites.filter(fav => fav.Comics.id !== comicId),
          }
        }
      },
      false // Don&apos;t revalidate immediately
    )
    
    try {
      // Make the actual API call
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comicId }),
      })
      
      if (!response.ok) throw new Error('Failed to update favorite')
      
      // Revalidate to get the latest data
      mutate()
    } catch (error) {
      // Revert optimistic update on error
      mutate()
      throw error
    }
  }

  return {
    isFavorite,
    isLoading,
    toggleFavorite,
  }
}

/**
 * Hook for user reading history with SWR caching
 */
export function useReadingHistory() {
  const { user, isAuthenticated } = useUserProfile()
  
  const readingHistory = user?.Reading_Progress || []
  
  return {
    readingHistory,
    isAuthenticated,
    // Helper to get recently read manga
    recentlyRead: readingHistory.slice(0, 10),
    // Helper to check if user has read a specific manga
    hasRead: (comicId: number) => readingHistory.some(progress => progress.Comics.id === comicId),
  }
}

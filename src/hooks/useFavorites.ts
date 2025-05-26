'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'


interface UseFavoritesOptions {
  comicId: number
  initialIsFavorite?: boolean
}

interface FavoriteResponse {
  action: 'added' | 'removed'
  isFavorite: boolean
}

/**
 * Custom hook for managing manga favorites
 */
export function useFavorites({ comicId, initialIsFavorite = false }: UseFavoritesOptions) {
  const { data: session, status } = useSession()
  const [isFavorite, setIsFavorite] = useState<boolean>(initialIsFavorite)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Check if the manga is favorited on mount
  useEffect(() => {
    // Only check if user is authenticated
    if (status === 'authenticated' && !initialIsFavorite) {
      checkFavoriteStatus()
    }
  }, [status, comicId])

  // Check if the manga is in user's favorites
  const checkFavoriteStatus = useCallback(async () => {
    if (status !== 'authenticated') {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/favorites/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comicId }),
      })

      if (!response.ok) {
        throw new Error('Failed to check favorite status')
      }

      const data = await response.json()
      setIsFavorite(data.isFavorite)
    } catch (err) {
      console.error('Error checking favorite status:', err)
      setError('Failed to check favorite status')
    } finally {
      setIsLoading(false)
    }
  }, [comicId, status])

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (status !== 'authenticated') {
      toast.error('Please log in to add favorites')
      return undefined
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comicId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite status')
      }

      const data: FavoriteResponse = await response.json()
      setIsFavorite(data.isFavorite)

      // Show success message
      if (data.action === 'added') {
        toast.success('Added to favorites')
      } else {
        toast.success('Removed from favorites')
      }

      return data
    } catch (err) {
      console.error('Error toggling favorite:', err)
      setError('Failed to update favorite status')
      toast.error('Failed to update favorite status')
      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [comicId, status])

  return {
    isFavorite,
    isLoading,
    error,
    toggleFavorite,
    checkFavoriteStatus,
    isAuthenticated: status === 'authenticated',
  }
}

/**
 * Hook to fetch all favorites for the current user
 */
export function useFavoritesList() {
  const { status } = useSession()
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 20,
  })

  // Fetch favorites
  const fetchFavorites = useCallback(async (page = 1, limit = 20) => {
    if (status !== 'authenticated') {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/favorites?page=${page}&limit=${limit}`)

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      setFavorites(data.favorites)
      setPagination(data.pagination)
      return data
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError('Failed to fetch favorites')
    } finally {
      setIsLoading(false)
    }
  }, [status])

  // Fetch favorites on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status, fetchFavorites])

  return {
    favorites,
    isLoading,
    error,
    pagination,
    fetchFavorites,
    isAuthenticated: status === 'authenticated',
  }
}

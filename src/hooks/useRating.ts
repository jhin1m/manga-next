'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ratingApi } from '@/lib/api/client'

interface UseRatingProps {
  mangaId: number
  initialRating?: number
  initialUserRating?: number
  initialTotalRatings?: number
}

interface RatingData {
  averageRating: number
  totalRatings: number
  userRating: number
}

export function useRating({
  mangaId,
  initialRating = 0,
  initialUserRating = 0,
  initialTotalRatings = 0,
}: UseRatingProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [ratingData, setRatingData] = useState<RatingData>({
    averageRating: initialRating,
    totalRatings: initialTotalRatings,
    userRating: initialUserRating,
  })

  const isAuthenticated = status === 'authenticated'

  // Only fetch rating data if no initial data provided (prevent duplicate API calls)
  useEffect(() => {
    // Skip API call if we already have server-side data
    if (initialRating !== undefined || initialTotalRatings !== undefined || initialUserRating !== undefined) {
      return
    }

    let isMounted = true

    const fetchRatingData = async () => {
      try {
        const data = await ratingApi.get(mangaId)

        // Only update if component is still mounted
        if (!isMounted) return

        setRatingData({
          averageRating: data.averageRating || 0,
          totalRatings: data.totalRatings || 0,
          userRating: data.userRating || 0,
        })
      } catch (error) {
        console.error('Error fetching rating data:', error)
        // Keep initial values on error
      }
    }

    if (mangaId) {
      fetchRatingData()
    }

    return () => {
      isMounted = false
    }
  }, [mangaId, initialRating, initialTotalRatings, initialUserRating])

  const submitRating = async (rating: number) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required')
    }

    setIsLoading(true)

    try {
      // Store current state for rollback
      const previousState = { ...ratingData }

      // Optimistic update
      const wasFirstRating = ratingData.userRating === 0
      let newTotalRatings = ratingData.totalRatings
      let newAverageRating = ratingData.averageRating

      if (wasFirstRating) {
        // New rating
        newTotalRatings = ratingData.totalRatings + 1
        newAverageRating = ((ratingData.averageRating * ratingData.totalRatings) + rating) / newTotalRatings
      } else {
        // Update existing rating
        newAverageRating = ((ratingData.averageRating * ratingData.totalRatings) - ratingData.userRating + rating) / ratingData.totalRatings
      }

      // Apply optimistic update
      setRatingData({
        averageRating: newAverageRating,
        totalRatings: newTotalRatings,
        userRating: rating,
      })

      // Submit to API
      const result = await ratingApi.submit({
        mangaId,
        rating,
      })

      // Update with actual server response
      setRatingData({
        averageRating: result.averageRating || newAverageRating,
        totalRatings: result.totalRatings || newTotalRatings,
        userRating: rating,
      })

      return {
        success: true,
        wasFirstRating,
        newRating: rating,
      }
    } catch (error) {
      // Revert optimistic update on error
      setRatingData(ratingData)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    ratingData,
    isLoading,
    isAuthenticated,
    submitRating,
  }
}

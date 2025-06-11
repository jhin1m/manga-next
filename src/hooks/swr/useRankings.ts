'use client'

import useSWR from 'swr'
import { cacheKeys, cacheConfigs } from '@/lib/swr/config'

// Types
type RankingCategory = 'most_viewed' | 'highest_rated' | 'most_bookmarked' | 'trending'
type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time'

interface MangaRankingItem {
  id: number
  title: string
  slug: string
  cover_image_url: string
  daily_views: number
  weekly_views: number
  monthly_views: number
  total_views: number
  total_favorites: number
  average_rating: number | null
  rating_count: number
  rank: number
  trend_direction: 'up' | 'down' | 'stable' | 'new'
}

interface RankingsResponse {
  success: boolean
  data: {
    category: RankingCategory
    period: RankingPeriod
    rankings: MangaRankingItem[]
    total: number
    lastUpdated: string
    pagination: {
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrevious: boolean
    }
  }
}

interface RankingsParams {
  page?: number
  limit?: number
}

/**
 * Hook for fetching manga rankings with SWR caching
 */
export function useRankings(
  category: RankingCategory,
  period: RankingPeriod,
  params: RankingsParams = {}
) {
  const cacheKey = cacheKeys.rankings(category, period, params)
  
  const { data, isLoading, error, mutate } = useSWR<RankingsResponse>(
    cacheKey,
    cacheConfigs.rankings
  )

  return {
    rankings: data?.data?.rankings || [],
    total: data?.data?.total || 0,
    lastUpdated: data?.data?.lastUpdated,
    pagination: data?.data?.pagination || {
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
    isLoading,
    error,
    mutate,
    success: data?.success || false,
  }
}

/**
 * Hook for fetching popular rankings (most commonly used combinations)
 * This replaces the problematic useMultipleRankings hook
 */
export function usePopularRankings(params: RankingsParams = {}) {
  // Fetch the most commonly used ranking combinations
  const mostViewedWeekly = useSWR<RankingsResponse>(
    cacheKeys.rankings('most_viewed', 'weekly', params),
    cacheConfigs.rankings
  )

  const trendingWeekly = useSWR<RankingsResponse>(
    cacheKeys.rankings('trending', 'weekly', params),
    cacheConfigs.rankings
  )

  const mostBookmarkedAllTime = useSWR<RankingsResponse>(
    cacheKeys.rankings('most_bookmarked', 'all_time', params),
    cacheConfigs.rankings
  )

  const isLoading = mostViewedWeekly.isLoading || trendingWeekly.isLoading || mostBookmarkedAllTime.isLoading
  const hasError = mostViewedWeekly.error || trendingWeekly.error || mostBookmarkedAllTime.error

  return {
    mostViewedWeekly: {
      rankings: mostViewedWeekly.data?.data?.rankings || [],
      total: mostViewedWeekly.data?.data?.total || 0,
      lastUpdated: mostViewedWeekly.data?.data?.lastUpdated,
      isLoading: mostViewedWeekly.isLoading,
      error: mostViewedWeekly.error,
      mutate: mostViewedWeekly.mutate,
    },
    trendingWeekly: {
      rankings: trendingWeekly.data?.data?.rankings || [],
      total: trendingWeekly.data?.data?.total || 0,
      lastUpdated: trendingWeekly.data?.data?.lastUpdated,
      isLoading: trendingWeekly.isLoading,
      error: trendingWeekly.error,
      mutate: trendingWeekly.mutate,
    },
    mostBookmarkedAllTime: {
      rankings: mostBookmarkedAllTime.data?.data?.rankings || [],
      total: mostBookmarkedAllTime.data?.data?.total || 0,
      lastUpdated: mostBookmarkedAllTime.data?.data?.lastUpdated,
      isLoading: mostBookmarkedAllTime.isLoading,
      error: mostBookmarkedAllTime.error,
      mutate: mostBookmarkedAllTime.mutate,
    },
    isLoading,
    hasError,
    // Helper to revalidate all rankings
    mutateAll: () => {
      mostViewedWeekly.mutate()
      trendingWeekly.mutate()
      mostBookmarkedAllTime.mutate()
    },
  }
}

/**
 * Hook for sidebar rankings (optimized for small display)
 */
export function useSidebarRankings(limit: number = 5) {
  const params = { limit }
  
  // Fetch popular manga for sidebar
  const { rankings, isLoading, error, mutate } = useRankings('most_viewed', 'weekly', params)

  return {
    sidebarRankings: rankings.slice(0, limit),
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for trending manga (special handling)
 */
export function useTrendingManga(period: RankingPeriod = 'weekly', params: RankingsParams = {}) {
  const { rankings, isLoading, error, mutate, lastUpdated } = useRankings('trending', period, params)

  return {
    trendingManga: rankings,
    isLoading,
    error,
    mutate,
    lastUpdated,
    // Helper to get top trending
    topTrending: rankings.slice(0, 10),
  }
}

/**
 * Hook for prefetching rankings (for performance optimization)
 */
export function useRankingsPrefetch() {
  const { mutate } = useSWR(() => null) // Dummy SWR hook to get mutate function

  const prefetchRankings = (
    category: RankingCategory,
    period: RankingPeriod,
    params: RankingsParams = {}
  ) => {
    const cacheKey = cacheKeys.rankings(category, period, params)
    mutate(cacheKey)
  }

  const prefetchPopularRankings = () => {
    // Prefetch the most commonly viewed rankings
    prefetchRankings('most_viewed', 'weekly')
    prefetchRankings('most_viewed', 'daily')
    prefetchRankings('trending', 'weekly')
  }

  return {
    prefetchRankings,
    prefetchPopularRankings,
  }
}

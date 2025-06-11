'use client'

import useSWR from 'swr'
import { cacheKeys, cacheConfigs } from '@/lib/swr/config'

// Types
interface SearchParams {
  q: string
  limit?: number
  sort?: string
}

interface SearchResult {
  id: number
  title: string
  slug: string
  description: string
  cover_image_url: string
  status: string
  genres: Array<{ name: string; slug: string }>
  author: string
  total_views: number
  average_rating: number
  highlightedTitle?: string
  highlightedDescription?: string
  rank?: number
}

interface SearchResponse {
  comics: SearchResult[]
  totalPages: number
  currentPage: number
  totalResults: number
  searchTerms: string[]
}

/**
 * Hook for searching manga with SWR caching
 * Includes debouncing and smart caching for search results
 */
export function useSearch(query: string, params: Omit<SearchParams, 'q'> = {}) {
  // Don&apos;t search if query is empty or too short
  const shouldSearch = query && query.trim().length >= 2
  const cacheKey = shouldSearch ? cacheKeys.search(query.trim(), params) : null
  
  const { data, isLoading, error, mutate } = useSWR<SearchResponse>(
    cacheKey,
    cacheConfigs.search
  )

  return {
    results: data?.comics || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    totalResults: data?.totalResults || 0,
    searchTerms: data?.searchTerms || [],
    isLoading: shouldSearch ? isLoading : false,
    error: shouldSearch ? error : null,
    mutate,
    // Helper to check if we have results
    hasResults: (data?.comics?.length || 0) > 0,
    // Helper to check if search was performed
    hasSearched: shouldSearch && !isLoading,
  }
}

/**
 * Hook for search suggestions/autocomplete
 * Uses shorter cache time for more responsive suggestions
 */
export function useSearchSuggestions(query: string, limit: number = 5) {
  const shouldSearch = query && query.trim().length >= 1
  const params = { limit }
  const cacheKey = shouldSearch ? cacheKeys.search(query.trim(), params) : null
  
  const { data, isLoading, error } = useSWR<SearchResponse>(
    cacheKey,
    {
      ...cacheConfigs.search,
      refreshInterval: 30 * 1000, // 30 seconds for suggestions
      dedupingInterval: 5 * 1000, // 5 seconds deduping
    }
  )

  return {
    suggestions: data?.comics?.slice(0, limit) || [],
    isLoading: shouldSearch ? isLoading : false,
    error: shouldSearch ? error : null,
  }
}

/**
 * Hook for prefetching search results (for performance optimization)
 */
export function useSearchPrefetch() {
  const { mutate } = useSWR(() => null) // Dummy SWR hook to get mutate function

  const prefetchSearch = (query: string, params: Omit<SearchParams, 'q'> = {}) => {
    if (query && query.trim().length >= 2) {
      const cacheKey = cacheKeys.search(query.trim(), params)
      mutate(cacheKey)
    }
  }

  return {
    prefetchSearch,
  }
}

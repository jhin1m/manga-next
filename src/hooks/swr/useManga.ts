'use client'

import useSWR from 'swr'
import { cacheKeys, cacheConfigs } from '@/lib/swr/config'

// Types
interface MangaListParams {
  sort?: string
  status?: string
  genre?: string
  page?: number
  limit?: number
}

interface MangaListResponse {
  comics: unknown[]
  totalPages: number
  currentPage: number
  totalComics: number
}

interface MangaDetailResponse {
  id: number
  title: string
  slug: string
  description: string
  cover_image_url: string
  status: string
  genres: Array<{ name: string; slug: string }>
  author: string
  artist: string
  publication_year: number
  total_views: number
  total_favorites: number
  average_rating: number
  rating_count: number
  last_chapter_uploaded_at: string
  created_at: string
  updated_at: string
}

/**
 * Hook for fetching manga list with SWR caching
 */
export function useMangaList(params: MangaListParams = {}) {
  const cacheKey = cacheKeys.mangaList(params)
  
  const { data, isLoading, error, mutate } = useSWR<MangaListResponse>(
    cacheKey,
    {
      ...cacheConfigs.mangaList,
      // Special handling for popular manga (hot manga)
      ...(params.sort === 'popular' ? cacheConfigs.hotManga : {}),
    }
  )

  return {
    manga: data?.comics || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    totalComics: data?.totalComics || 0,
    isLoading,
    error,
    mutate, // For manual revalidation
  }
}

/**
 * Hook for fetching manga detail with SWR caching
 */
export function useMangaDetail(slug: string) {
  const cacheKey = slug ? cacheKeys.mangaDetail(slug) : null
  
  const { data, isLoading, error, mutate } = useSWR<MangaDetailResponse>(
    cacheKey,
    cacheConfigs.mangaDetail
  )

  return {
    manga: data,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for fetching manga chapters with SWR caching
 */
export function useMangaChapters(slug: string, params: { page?: number; limit?: number } = {}) {
  const cacheKey = slug ? cacheKeys.mangaChapters(slug, params) : null
  
  const { data, isLoading, error, mutate } = useSWR(
    cacheKey,
    cacheConfigs.mangaDetail // Use same config as manga detail
  )

  return {
    chapters: data?.chapters || [],
    totalChapters: data?.totalChapters || 0,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for fetching hot/popular manga with aggressive caching
 */
export function useHotManga(limit: number = 10) {
  const params = { sort: 'popular', limit }
  const cacheKey = cacheKeys.mangaList(params)
  
  const { data, isLoading, error, mutate } = useSWR<MangaListResponse>(
    cacheKey,
    cacheConfigs.hotManga // Use hot manga config with longer cache
  )

  return {
    hotManga: data?.comics || [],
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for fetching manga by genre with SWR caching
 */
export function useMangaByGenre(genreSlug: string, params: MangaListParams = {}) {
  const genreParams = { ...params, genre: genreSlug }
  const cacheKey = genreSlug ? cacheKeys.mangaList(genreParams) : null
  
  const { data, isLoading, error, mutate } = useSWR<MangaListResponse>(
    cacheKey,
    cacheConfigs.mangaList
  )

  return {
    manga: data?.comics || [],
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || 1,
    totalComics: data?.totalComics || 0,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for prefetching manga data (for performance optimization)
 */
export function useMangaPrefetch() {
  const { mutate } = useSWR(() => null) // Dummy SWR hook to get mutate function

  const prefetchMangaList = (params: MangaListParams = {}) => {
    const cacheKey = cacheKeys.mangaList(params)
    mutate(cacheKey)
  }

  const prefetchMangaDetail = (slug: string) => {
    const cacheKey = cacheKeys.mangaDetail(slug)
    mutate(cacheKey)
  }

  const prefetchHotManga = (limit: number = 10) => {
    const params = { sort: 'popular', limit }
    const cacheKey = cacheKeys.mangaList(params)
    mutate(cacheKey)
  }

  return {
    prefetchMangaList,
    prefetchMangaDetail,
    prefetchHotManga,
  }
}

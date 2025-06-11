import useSWR from 'swr'
import { cacheKeys, cacheConfigs } from '@/lib/swr/config'

interface Comment {
  id: number
  content: string
  user: {
    id: number
    username: string
    avatar_url?: string
  }
  likes_count: number
  dislikes_count: number
  created_at: string
  updated_at: string
  parent_id?: number
  replies?: Comment[]
  userLikeStatus?: 'like' | 'dislike' | null
}

interface CommentsResponse {
  comments: Comment[]
  totalComments: number
  hasNextPage: boolean
  nextCursor?: string
}

interface CommentsParams {
  page?: number
  limit?: number
  cursor?: string
  sort?: 'newest' | 'oldest' | 'most_liked'
}

/**
 * Hook for fetching manga comments with SWR caching
 */
export function useComments(mangaId: number, params: CommentsParams = {}) {
  const cacheKey = cacheKeys.comments(mangaId, params)
  
  const { data, isLoading, error, mutate } = useSWR<CommentsResponse>(
    cacheKey,
    cacheConfigs.comments
  )

  return {
    comments: data?.comments || [],
    totalComments: data?.totalComments || 0,
    hasNextPage: data?.hasNextPage || false,
    nextCursor: data?.nextCursor,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for fetching chapter comments
 */
export function useChapterComments(chapterId: number, params: CommentsParams = {}) {
  const cacheKey = cacheKeys.chapterComments(chapterId, params)
  
  const { data, isLoading, error, mutate } = useSWR<CommentsResponse>(
    cacheKey,
    cacheConfigs.comments
  )

  return {
    comments: data?.comments || [],
    totalComments: data?.totalComments || 0,
    hasNextPage: data?.hasNextPage || false,
    nextCursor: data?.nextCursor,
    isLoading,
    error,
    mutate,
  }
}

/**
 * Hook for fetching user's comments
 */
export function useUserComments(userId: number, params: CommentsParams = {}) {
  const cacheKey = cacheKeys.userComments(userId, params)
  
  const { data, isLoading, error, mutate } = useSWR<CommentsResponse>(
    cacheKey,
    cacheConfigs.comments
  )

  return {
    comments: data?.comments || [],
    totalComments: data?.totalComments || 0,
    hasNextPage: data?.hasNextPage || false,
    nextCursor: data?.nextCursor,
    isLoading,
    error,
    mutate,
  }
}

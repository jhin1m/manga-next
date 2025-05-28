"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Comment, CommentListResponse } from '@/types/comment'
import { commentApi } from '@/lib/api/client'

interface LoadMoreCommentsProps {
  mangaId?: number
  chapterId?: number
  viewMode: 'chapter' | 'all'
  sortBy: 'newest' | 'oldest' | 'most_liked'
  lastCommentId?: number
  onCommentsLoaded: (comments: Comment[], hasMore: boolean) => void
  disabled?: boolean
}

export default function LoadMoreComments({
  mangaId,
  chapterId,
  viewMode,
  sortBy,
  lastCommentId,
  onCommentsLoaded,
  disabled = false
}: LoadMoreCommentsProps) {
  const [loading, setLoading] = useState(false)

  const loadMoreComments = async () => {
    if (!lastCommentId || loading || disabled) return

    try {
      setLoading(true)

      const params = {
        limit: 10, // Giảm xuống 10 để test Load More
        sort: sortBy,
        view_mode: viewMode,
        pagination_type: 'cursor' as const,
        cursor: lastCommentId.toString(),
        ...(mangaId ? { comic_id: mangaId } : {}),
        ...(chapterId && viewMode === 'chapter' ? { chapter_id: chapterId } : {}),
      }

      const data: CommentListResponse = await commentApi.getList(params)

      // Check if there are more comments by looking at the nextCursor
      const hasMore = data.pagination?.nextCursor != null

      onCommentsLoaded(data.comments, hasMore)
    } catch (error) {
      console.error('Error loading more comments:', error)
      toast.error('Failed to load more comments')
    } finally {
      setLoading(false)
    }
  }

  if (!lastCommentId) {
    return null
  }

  return (
    <div className="flex justify-center mt-6">
      <Button
        variant="outline"
        onClick={loadMoreComments}
        disabled={loading || disabled}
        className="min-w-[200px]"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading more comments...
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4 mr-2" />
            Load More Comments
          </>
        )}
      </Button>
    </div>
  )
}

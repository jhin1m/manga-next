"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MessageCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'
import CommentPagination from './CommentPagination'
import LoadMoreComments from './LoadMoreComments'
import { Comment, CommentListResponse } from '@/types/comment'
import { commentApi } from '@/lib/api/client'

interface CommentSectionProps {
  mangaId?: number
  chapterId?: number
  mangaSlug?: string
  chapterSlug?: string
  initialCommentsCount?: number
  defaultViewMode?: 'chapter' | 'all'
  hideToggle?: boolean
  paginationType?: 'offset' | 'cursor' // New prop to control pagination type
}

export default function CommentSection({
  mangaId,
  chapterId,
  mangaSlug,
  chapterSlug,
  initialCommentsCount = 0,
  defaultViewMode = 'chapter',
  hideToggle = false,
  paginationType = 'offset'
}: CommentSectionProps) {
  const { data: session } = useSession()
  const t = useTranslations('comments')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    total?: number
    currentPage?: number
    totalPages?: number
    perPage: number
    nextCursor?: string
    hasMore?: boolean
  }>({
    total: initialCommentsCount,
    currentPage: 1,
    totalPages: 1,
    perPage: 20,
    hasMore: false
  })
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest')
  const [viewMode, setViewMode] = useState<'chapter' | 'all'>(defaultViewMode)
  const [showForm, setShowForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  // Fetch comments
  const fetchComments = async (page = 1, sort = sortBy, mode = viewMode, resetComments = true) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        limit: 10, // Giảm xuống 10 để test Load More
        sort,
        view_mode: mode,
        pagination_type: paginationType,
        ...(paginationType === 'offset' ? { page } : {}),
        ...(mangaId ? { comic_id: mangaId } : {}),
        ...(chapterId && mode === 'chapter' ? { chapter_id: chapterId } : {}),
      }

      const data: CommentListResponse = await commentApi.getList(params)

      if (resetComments) {
        setComments(data.comments)
      } else {
        // For "Load More" functionality
        setComments(prevComments => [...prevComments, ...data.comments])
      }

      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.failedToLoad'))
      toast.error(t('messages.failedToLoad'))
    } finally {
      setLoading(false)
    }
  }

  // Load more comments for cursor-based pagination
  const handleLoadMoreComments = (newComments: Comment[], hasMore: boolean) => {
    setComments(prevComments => [...prevComments, ...newComments])
    setPagination(prev => ({
      ...prev,
      hasMore,
      nextCursor: newComments.length > 0 ? newComments[newComments.length - 1].id.toString() : undefined
    }))
  }

  // Handle new comment
  const handleCommentAdded = (newComment: Comment) => {
    if (replyingTo) {
      // If it's a reply, add it to the parent comment's replies
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === replyingTo
            ? {
                ...comment,
                other_Comments: [...(comment.other_Comments || []), newComment],
                repliesCount: (comment.repliesCount || 0) + 1
              }
            : comment
        )
      )
      setReplyingTo(null)
    } else {
      // If it's a top-level comment, add it to the beginning
      setComments(prevComments => [newComment, ...prevComments])
      setPagination(prev => ({ ...prev, total: (prev.total || 0) + 1 }))
    }
    setShowForm(false)
    // Note: Toast notification is handled in CommentForm to avoid duplicates
  }

  // Handle comment update
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    )
    toast.success(t('messages.commentUpdated'))
  }

  // Handle comment deletion
  const handleCommentDeleted = (commentId: number) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== commentId)
    )
    setPagination(prev => ({ ...prev, total: Math.max((prev.total || 0) - 1, 0) }))
    toast.success(t('messages.commentDeleted'))
  }

  // Handle like/dislike
  const handleCommentLiked = (commentId: number, newLikesCount: number, newDislikesCount: number, userLikeStatus: 'like' | 'dislike' | null) => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes_count: newLikesCount,
            dislikes_count: newDislikesCount,
            userLikeStatus
          }
        }
        // Also check replies
        if (comment.other_Comments) {
          return {
            ...comment,
            other_Comments: comment.other_Comments.map(reply =>
              reply.id === commentId
                ? {
                    ...reply,
                    likes_count: newLikesCount,
                    dislikes_count: newDislikesCount,
                    userLikeStatus
                  }
                : reply
            )
          }
        }
        return comment
      })
    )
  }

  // Handle sort change
  const handleSortChange = (newSort: 'newest' | 'oldest' | 'most_liked') => {
    setSortBy(newSort)
    fetchComments(1, newSort, viewMode)
  }

  // Handle view mode change
  const handleViewModeChange = (value: string) => {
    const newMode = value as 'chapter' | 'all'
    setViewMode(newMode)
    fetchComments(1, sortBy, newMode)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchComments(page, sortBy, viewMode)
  }

  // Handle reply
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId)
    setShowForm(true)
  }

  useEffect(() => {
    fetchComments()
  }, [mangaId, chapterId, viewMode])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchComments()}
            className="mt-4"
          >
            {t('messages.tryAgain')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle - Only show when both mangaId and chapterId are available and not hidden */}
      {mangaId && chapterId && !hideToggle && (
        <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chapter">{t('chapterComments')}</TabsTrigger>
            <TabsTrigger value="all">{t('allComments')}</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('title')} ({pagination.total ?? comments.length})
            </CardTitle>

            {/* Sort Options */}
            <div className="flex gap-2">
              {/* Desktop: Show all buttons */}
              <div className="hidden sm:flex gap-2">
                <Button
                  variant={sortBy === 'newest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('newest')}
                >
                  {t('sortBy.newest')}
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('oldest')}
                >
                  {t('sortBy.oldest')}
                </Button>
                <Button
                  variant={sortBy === 'most_liked' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('most_liked')}
                >
                  {t('sortBy.mostLiked')}
                </Button>
              </div>

              {/* Mobile: Show dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {sortBy === 'newest' ? t('sortBy.newest') :
                       sortBy === 'oldest' ? t('sortBy.oldest') : t('sortBy.mostLiked')}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                      {t('sortBy.newest')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                      {t('sortBy.oldest')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('most_liked')}>
                      {t('sortBy.mostLiked')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Comment Form */}
          {session ? (
            <div className="mb-6">
              {!showForm ? (
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full"
                >
                  {t('writeComment')}
                </Button>
              ) : (
                <CommentForm
                  mangaId={mangaId}
                  chapterId={chapterId}
                  parentCommentId={replyingTo}
                  onCommentAdded={handleCommentAdded}
                  onCancel={() => {
                    setShowForm(false)
                    setReplyingTo(null)
                  }}
                />
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">
                Please <a href="/auth/login" className="text-primary hover:underline">{t('signIn')}</a> to post comments.
              </p>
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onUpdate={handleCommentUpdated}
                  onDelete={handleCommentDeleted}
                  onLike={handleCommentLiked}
                  currentUserId={session?.user?.id ? parseInt(session.user.id) : undefined}
                  isAdmin={session?.user?.role === 'admin'}
                  showSourceBadge={viewMode === 'all' || defaultViewMode === 'all'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('noCommentsYet')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {paginationType === 'offset' && pagination.totalPages && pagination.totalPages > 1 && (
            <div className="mt-6">
              <CommentPagination
                currentPage={pagination.currentPage || 1}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Load More for cursor-based pagination */}
          {paginationType === 'cursor' && pagination.hasMore && comments.length > 0 && (
            <LoadMoreComments
              mangaId={mangaId}
              chapterId={chapterId}
              viewMode={viewMode}
              sortBy={sortBy}
              lastCommentId={comments[comments.length - 1]?.id}
              onCommentsLoaded={handleLoadMoreComments}
              disabled={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Comment, CommentListResponse } from '@/types/comment'

interface CommentSectionProps {
  mangaId?: number
  chapterId?: number
  mangaSlug?: string
  chapterSlug?: string
  initialCommentsCount?: number
}

export default function CommentSection({
  mangaId,
  chapterId,
  mangaSlug,
  chapterSlug,
  initialCommentsCount = 0
}: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: initialCommentsCount,
    currentPage: 1,
    totalPages: 1,
    perPage: 20
  })
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest')
  const [showForm, setShowForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  // Fetch comments
  const fetchComments = async (page = 1, sort = sortBy) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort,
        ...(mangaId ? { comic_id: mangaId.toString() } : {}),
        ...(chapterId ? { chapter_id: chapterId.toString() } : {}),
      })

      const response = await fetch(`/api/comments?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }

      const data: CommentListResponse = await response.json()
      setComments(data.comments)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
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
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
    }
    setShowForm(false)
    toast.success('Comment posted successfully!')
  }

  // Handle comment update
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    )
    toast.success('Comment updated successfully!')
  }

  // Handle comment deletion
  const handleCommentDeleted = (commentId: number) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== commentId)
    )
    setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    toast.success('Comment deleted successfully!')
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
    fetchComments(1, newSort)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchComments(page, sortBy)
  }

  // Handle reply
  const handleReply = (commentId: number) => {
    setReplyingTo(commentId)
    setShowForm(true)
  }

  useEffect(() => {
    fetchComments()
  }, [mangaId, chapterId])

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
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({pagination.total})
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
                  Newest
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('oldest')}
                >
                  Oldest
                </Button>
                <Button
                  variant={sortBy === 'most_liked' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange('most_liked')}
                >
                  Most Liked
                </Button>
              </div>

              {/* Mobile: Show dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {sortBy === 'newest' ? 'Newest' :
                       sortBy === 'oldest' ? 'Oldest' : 'Most Liked'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('most_liked')}>
                      Most Liked
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
                  Write a comment...
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
                Please <a href="/auth/login" className="text-primary hover:underline">sign in</a> to post comments.
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
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <CommentPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

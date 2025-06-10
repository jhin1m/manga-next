"use client"

import { useState, memo, useCallback } from 'react'
import { useFormat } from '@/hooks/useFormat'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Shield,
  Crown
} from 'lucide-react'
import { toast } from 'sonner'
import { Comment } from '@/types/comment'
import CommentForm from './CommentForm'
import CommentReportDialog from './CommentReportDialog'
import { commentApi } from '@/lib/api/client'

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: number) => void
  onUpdate: (comment: Comment) => void
  onDelete: (commentId: number) => void
  onLike: (commentId: number, likesCount: number, dislikesCount: number, userLikeStatus: 'like' | 'dislike' | null) => void
  currentUserId?: number
  isAdmin?: boolean
  isReply?: boolean
  showSourceBadge?: boolean
}

const CommentItem = memo(function CommentItem({
  comment,
  onReply,
  onUpdate,
  onDelete,
  onLike,
  currentUserId,
  isAdmin = false,
  isReply = false,
  showSourceBadge = false
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [loading, setLoading] = useState(false)
  const { formatDate } = useFormat()
  const t = useTranslations('comments')

  const isOwner = currentUserId === comment.user_id
  const canEdit = isOwner && !isReply && (comment.edit_count || 0) < 1 // Only allow editing top-level comments once
  const canDelete = isOwner || isAdmin
  const canReport = currentUserId && !isOwner

  // Get source badge for comment
  const getSourceBadge = () => {
    if (!showSourceBadge) return null

    // Only show badge for chapter comments, not general comments
    if (comment.chapter_id && comment.Chapters) {
      return (
        <Badge variant="outline" className="text-xs">
          {t('badges.chapter', { number: comment.Chapters.chapter_number })}
        </Badge>
      )
    }
    return null
  }

  // Handle like/dislike
  const handleLike = useCallback(async (isLike: boolean) => {
    if (!currentUserId) {
      toast.error(t('messages.signInToLike'))
      return
    }

    try {
      setLoading(true)
      const data = await commentApi.like(comment.id, isLike)
      onLike(comment.id, data.likes_count, data.dislikes_count, data.userLikeStatus)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.failedToLike'))
    } finally {
      setLoading(false)
    }
  }, [currentUserId, comment.id, onLike, t])

  // Handle delete
  const handleDelete = useCallback(async () => {
    try {
      setLoading(true)
      await commentApi.delete(comment.id)
      onDelete(comment.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.failedToDelete'))
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }, [comment.id, onDelete, t])

  // Handle edit
  const handleEdit = (updatedComment: Comment) => {
    setIsEditing(false)
    onUpdate(updatedComment)
  }

  // Get user role badge
  const getUserRoleBadge = () => {
    if (comment.Users.role === 'admin') {
      return <Badge variant="destructive" className="text-xs"><Crown className="h-3 w-3 mr-1" />{t('badges.admin')}</Badge>
    }
    if (comment.Users.role === 'moderator') {
      return <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />{t('badges.moderator')}</Badge>
    }
    return null
  }

  // Get status badge
  const getStatusBadge = () => {
    if (comment.status === 'PENDING') {
      return <Badge variant="outline" className="text-xs">{t('status.pending')}</Badge>
    }
    if (comment.status === 'FLAGGED') {
      return <Badge variant="destructive" className="text-xs">{t('status.flagged')}</Badge>
    }
    return null
  }

  return (
    <div className={`space-y-3 ${isReply ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage
            src={comment.Users.avatar_url || undefined}
            alt={comment.Users.username}
          />
          <AvatarFallback className="text-sm font-medium">
            {comment.Users.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.Users.username}</span>
            {getUserRoleBadge()}
            {getStatusBadge()}
            {getSourceBadge()}
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">{t('status.edited')}</span>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <CommentForm
              initialContent={comment.content}
              commentId={comment.id}
              onCommentAdded={handleEdit}
              onCancel={() => setIsEditing(false)}
              isEditing
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Like/Dislike */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(true)}
                disabled={loading}
                className={`h-8 px-2 ${comment.userLikeStatus === 'like' ? 'text-green-600 bg-green-50' : ''}`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {comment.likes_count}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(false)}
                disabled={loading}
                className={`h-8 px-2 ${comment.userLikeStatus === 'dislike' ? 'text-red-600 bg-red-50' : ''}`}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {comment.dislikes_count}
              </Button>
            </div>

            {/* Reply */}
            {!isReply && currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-8 px-2"
              >
                <Reply className="h-4 w-4 mr-1" />
                {t('actions.reply')}
              </Button>
            )}

            {/* More Actions */}
            {(canEdit || canDelete || canReport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('actions.edit')}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  )}
                  {canReport && (
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="h-4 w-4 mr-2" />
                      {t('actions.report')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Replies */}
          {!isReply && comment.other_Comments && comment.other_Comments.length > 0 && (
            <div className="space-y-3">
              {showReplies && (
                <div className="space-y-4">
                  {comment.other_Comments.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onLike={onLike}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      isReply
                      showSourceBadge={showSourceBadge}
                    />
                  ))}
                </div>
              )}

              {comment.repliesCount && comment.repliesCount > (comment.other_Comments?.length || 0) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-primary"
                >
                  {showReplies
                    ? t('actions.hideReplies', { count: comment.repliesCount - (comment.other_Comments?.length || 0) })
                    : t('actions.showReplies', { count: comment.repliesCount - (comment.other_Comments?.length || 0) })
                  }
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('deleteDialog.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      {showReportDialog && (
        <CommentReportDialog
          commentId={comment.id}
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
        />
      )}
    </div>
  )
});

export default CommentItem;

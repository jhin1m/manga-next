"use client"

import { useState } from 'react'
import { formatDate } from '@/lib/utils/format'
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

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: number) => void
  onUpdate: (comment: Comment) => void
  onDelete: (commentId: number) => void
  onLike: (commentId: number, likesCount: number, dislikesCount: number, userLikeStatus: 'like' | 'dislike' | null) => void
  currentUserId?: number
  isAdmin?: boolean
  isReply?: boolean
}

export default function CommentItem({
  comment,
  onReply,
  onUpdate,
  onDelete,
  onLike,
  currentUserId,
  isAdmin = false,
  isReply = false
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [loading, setLoading] = useState(false)

  const isOwner = currentUserId === comment.user_id
  const canEdit = isOwner && !isReply // Only allow editing top-level comments
  const canDelete = isOwner || isAdmin
  const canReport = currentUserId && !isOwner

  // Handle like/dislike
  const handleLike = async (isLike: boolean) => {
    if (!currentUserId) {
      toast.error('Please sign in to like comments')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_like: isLike })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to like comment')
      }

      const data = await response.json()
      onLike(comment.id, data.likes_count, data.dislikes_count, data.userLikeStatus)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to like comment')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete comment')
      }

      onDelete(comment.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle edit
  const handleEdit = (updatedComment: Comment) => {
    setIsEditing(false)
    onUpdate(updatedComment)
  }

  // Get user role badge
  const getUserRoleBadge = () => {
    if (comment.Users.role === 'admin') {
      return <Badge variant="destructive" className="text-xs"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
    }
    if (comment.Users.role === 'moderator') {
      return <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />Mod</Badge>
    }
    return null
  }

  // Get status badge
  const getStatusBadge = () => {
    if (comment.status === 'PENDING') {
      return <Badge variant="outline" className="text-xs">Pending</Badge>
    }
    if (comment.status === 'FLAGGED') {
      return <Badge variant="destructive" className="text-xs">Flagged</Badge>
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
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground">(edited)</span>
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
                Reply
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
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {canReport && (
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
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
                    />
                  ))}
                </div>
              )}

              {comment.repliesCount && comment.repliesCount > (comment.other_Comments?.length || 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-primary"
                >
                  {showReplies ? 'Hide' : 'Show'} {comment.repliesCount - (comment.other_Comments?.length || 0)} more replies
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
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
}

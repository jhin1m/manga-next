"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Comment, commentCreateSchema, commentUpdateSchema } from '@/types/comment'

const formSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .refine(content => content.trim().length > 0, 'Comment cannot be only whitespace'),
})

interface CommentFormProps {
  mangaId?: number
  chapterId?: number
  parentCommentId?: number | null
  commentId?: number // For editing
  initialContent?: string
  onCommentAdded: (comment: Comment) => void
  onCancel: () => void
  isEditing?: boolean
}

export default function CommentForm({
  mangaId,
  chapterId,
  parentCommentId,
  commentId,
  initialContent = '',
  onCommentAdded,
  onCancel,
  isEditing = false
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialContent,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      if (isEditing && commentId) {
        // Update existing comment
        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: values.content })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update comment')
        }

        const data = await response.json()
        onCommentAdded(data.comment)
      } else {
        // Create new comment
        const requestData = {
          content: values.content,
          ...(mangaId ? { comic_id: mangaId } : {}),
          ...(chapterId ? { chapter_id: chapterId } : {}),
          ...(parentCommentId ? { parent_comment_id: parentCommentId } : {}),
        }

        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to post comment')
        }

        const data = await response.json()
        onCommentAdded(data.comment)
        
        // Show appropriate message based on comment status
        if (data.comment.status === 'PENDING') {
          toast.info('Comment submitted for review')
        } else {
          toast.success('Comment posted successfully!')
        }
      }

      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = form.watch('content')?.length || 0
  const maxCharacters = 2000

  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={
                        parentCommentId 
                          ? "Write a reply..." 
                          : "Share your thoughts about this manga..."
                      }
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <FormMessage />
                    <span className={characterCount > maxCharacters * 0.9 ? 'text-orange-500' : ''}>
                      {characterCount}/{maxCharacters}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || characterCount === 0 || characterCount > maxCharacters}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update' : 'Post Comment'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Guidelines */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Community Guidelines</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Be respectful and constructive in your comments</li>
            <li>• Avoid spoilers without proper warnings</li>
            <li>• No spam, harassment, or inappropriate content</li>
            <li>• Stay on topic and relevant to the manga/chapter</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
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
import { Comment } from '@/types/comment'
import { commentApi } from '@/lib/api/client'
import { validateCommentContent } from '@/lib/utils/badWords'

// Create schema with dynamic validation messages
const createFormSchema = (t: any) => z.object({
  content: z.string()
    .min(1, t('form.validation.required'))
    .max(500, t('form.validation.maxLength', { max: 500 }))
    .refine(content => content.trim().length > 0, t('form.validation.whitespace'))
    .refine(content => {
      const validation = validateCommentContent(content)
      if (!validation.isValid) {
        // Get the first error for the validation message
        const firstError = validation.errors[0]
        if (firstError.type === 'inappropriateContent' && firstError.data?.words) {
          throw new z.ZodError([{
            code: 'custom',
            message: t('form.validation.inappropriateContent', { words: firstError.data.words.join(', ') }),
            path: ['content']
          }])
        } else {
          throw new z.ZodError([{
            code: 'custom',
            message: t(`form.validation.${firstError.type}`),
            path: ['content']
          }])
        }
      }
      return true
    }, t('form.validation.inappropriateContent', { words: '' })),
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
  const t = useTranslations('comments')
  const formSchema = createFormSchema(t)

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
        const data = await commentApi.update(commentId, { content: values.content })
        onCommentAdded(data.comment)
      } else {
        // Create new comment
        const requestData = {
          content: values.content,
          ...(mangaId ? { comic_id: mangaId } : {}),
          ...(chapterId ? { chapter_id: chapterId } : {}),
          ...(parentCommentId ? { parent_comment_id: parentCommentId } : {}),
        }

        const data = await commentApi.create(requestData)
        onCommentAdded(data.comment)

        // Show appropriate message based on comment status
        if (data.comment.status === 'PENDING') {
          toast.info(t('messages.commentPending'))
        } else {
          toast.success(t('messages.commentPosted'))
        }
      }

      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.failedToPost'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = form.watch('content')?.length || 0
  const maxCharacters = 500

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
                          ? t('form.placeholder.reply')
                          : t('form.placeholder.comment')
                      }
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <FormMessage />
                    <span className={characterCount > maxCharacters * 0.9 ? 'text-orange-500' : ''}>
                      {t('form.characterCount', { current: characterCount, max: maxCharacters })}
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
                {t('actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || characterCount === 0 || characterCount > maxCharacters}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? t('actions.updating') : t('actions.posting')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isEditing ? t('actions.update') : t('actions.postComment')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Guidelines */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">{t('form.guidelines.title')}</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• {t('form.guidelines.respectful')}</li>
            <li>• {t('form.guidelines.spoilers')}</li>
            <li>• {t('form.guidelines.noSpam')}</li>
            <li>• {t('form.guidelines.stayOnTopic')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

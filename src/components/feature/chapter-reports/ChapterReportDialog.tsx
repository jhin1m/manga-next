'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { chapterReportSchema, CHAPTER_REPORT_REASONS } from '@/types/chapter-report'

interface ChapterReportDialogProps {
  chapterId: number
  chapterTitle?: string
  mangaTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChapterReportDialog({
  chapterId,
  chapterTitle,
  mangaTitle,
  open,
  onOpenChange
}: ChapterReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof chapterReportSchema>>({
    resolver: zodResolver(chapterReportSchema),
    defaultValues: {
      reason: undefined,
      details: '',
    },
  })

  const selectedReason = form.watch('reason')

  const onSubmit = async (values: z.infer<typeof chapterReportSchema>) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/chapters/${chapterId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to report chapter')
      }

      toast.success('Chapter reported successfully. Thank you for helping us improve the content quality.')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to report chapter')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Chapter Issue
          </DialogTitle>
          <DialogDescription>
            Report technical issues with this chapter. Your feedback helps us maintain content quality.
          </DialogDescription>
          {mangaTitle && chapterTitle && (
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              <strong>{mangaTitle}</strong> - {chapterTitle}
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CHAPTER_REPORT_REASONS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Additional Details
                    {selectedReason === 'other' && ' *'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        selectedReason === 'other'
                          ? 'Please describe the issue in detail...'
                          : 'Provide additional context about the issue (optional)...'
                      }
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

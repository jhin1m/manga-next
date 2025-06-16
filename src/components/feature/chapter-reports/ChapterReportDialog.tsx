'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { createChapterReportSchema, getTranslatedReasons } from '@/types/chapter-report';
import { chapterReportApi } from '@/lib/api/client';

interface ChapterReportDialogProps {
  chapterId: number;
  chapterTitle?: string;
  mangaTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChapterReportDialog({
  chapterId,
  chapterTitle,
  mangaTitle,
  open,
  onOpenChange,
}: ChapterReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('chapterReport');

  const chapterReportSchema = createChapterReportSchema(t);

  const form = useForm<z.infer<typeof chapterReportSchema>>({
    resolver: zodResolver(chapterReportSchema),
    defaultValues: {
      reason: undefined,
      details: '',
    },
  });

  const selectedReason = form.watch('reason');
  const detailsValue = form.watch('details');
  const translatedReasons = getTranslatedReasons(t);

  // Count words in details
  const wordCount = detailsValue
    ? detailsValue
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0).length
    : 0;

  const onSubmit = async (values: z.infer<typeof chapterReportSchema>) => {
    try {
      setIsSubmitting(true);

      await chapterReportApi.report(chapterId, values);

      toast.success(t('reportSuccess'));
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('reportError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-orange-500' />
            {t('reportChapterIssueTitle')}
          </DialogTitle>
          <DialogDescription>{t('reportChapterIssueDescription')}</DialogDescription>
          {mangaTitle && chapterTitle && (
            <div className='mt-2 p-2 bg-muted rounded text-sm'>
              <strong>{mangaTitle}</strong> - {chapterTitle}
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('issueTypeRequired')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectIssueType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(translatedReasons).map(([value, label]) => (
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
              name='details'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('additionalDetails')}
                    {selectedReason === 'other' && ' *'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        selectedReason === 'other'
                          ? t('additionalDetailsPlaceholder')
                          : t('additionalDetailsOptional')
                      }
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <div className='flex justify-between items-center text-xs text-muted-foreground'>
                    <FormMessage />
                    <span className={wordCount > 50 ? 'text-destructive' : ''}>
                      {wordCount}/50 {t('words')}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isSubmitting ? t('submitting') : t('submitReport')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

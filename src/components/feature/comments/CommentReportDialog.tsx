'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { commentReportSchema } from '@/types/comment';
import { commentApi } from '@/lib/api/client';

interface CommentReportDialogProps {
  commentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentReportDialog({
  commentId,
  open,
  onOpenChange,
}: CommentReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('comments.reportDialog');

  const reportReasons = [
    { value: 'spam', label: t('reasons.spam') },
    { value: 'harassment', label: t('reasons.harassment') },
    { value: 'inappropriate_content', label: t('reasons.inappropriate_content') },
    { value: 'spoilers', label: t('reasons.spoilers') },
    { value: 'off_topic', label: t('reasons.off_topic') },
    { value: 'other', label: t('reasons.other') },
  ];

  const form = useForm<z.infer<typeof commentReportSchema>>({
    resolver: zodResolver(commentReportSchema),
    defaultValues: {
      reason: 'spam',
      details: '',
    },
  });

  const selectedReason = form.watch('reason');

  const onSubmit = async (values: z.infer<typeof commentReportSchema>) => {
    try {
      setIsSubmitting(true);

      await commentApi.report(commentId, values);

      toast.success(t('success'));
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Flag className='h-5 w-5' />
            {t('title')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>{t('reasonLabel')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='grid grid-cols-1 gap-2'
                    >
                      {reportReasons.map(reason => (
                        <div key={reason.value} className='flex items-center space-x-2'>
                          <RadioGroupItem value={reason.value} id={reason.value} />
                          <Label
                            htmlFor={reason.value}
                            className='text-sm font-normal cursor-pointer flex-1'
                          >
                            {reason.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === 'other' && (
              <FormField
                control={form.control}
                name='details'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('detailsLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('detailsPlaceholder')}
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <Flag className='h-4 w-4 mr-2' />
                    {t('submit')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <div className='mt-4 p-3 bg-muted rounded-lg'>
          <p className='text-xs text-muted-foreground'>
            <strong>Note:</strong> {t('note')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

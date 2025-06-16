'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ChapterReportDialog } from './ChapterReportDialog';
import { toast } from 'sonner';

interface ChapterReportButtonProps {
  chapterId: number;
  chapterTitle?: string;
  mangaTitle?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  iconOnly?: boolean;
}

export function ChapterReportButton({
  chapterId,
  chapterTitle,
  mangaTitle,
  variant = 'outline',
  size = 'sm',
  className,
  iconOnly = false,
}: ChapterReportButtonProps) {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useTranslations('chapterReport');

  const handleClick = () => {
    if (!session) {
      toast.error(t('loginRequired'));
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick} className={className}>
        <AlertTriangle className={iconOnly ? 'h-5 w-5' : 'h-4 w-4 mr-2'} />
        {!iconOnly && t('reportIssue')}
        {iconOnly && <span className='sr-only'>{t('reportChapterIssue')}</span>}
      </Button>

      <ChapterReportDialog
        chapterId={chapterId}
        chapterTitle={chapterTitle}
        mangaTitle={mangaTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

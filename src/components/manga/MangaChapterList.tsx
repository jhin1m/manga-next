'use client';

import { useState, useEffect } from 'react';
import LoadingLink from '@/components/ui/LoadingLink';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { useFormat } from '@/hooks/useFormat';
import { getReadingHistory } from '@/lib/utils/readingHistory';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface Chapter {
  id: string;
  number: number;
  title: string;
  slug: string;
  releaseDate: string;
  views: number;
}

interface MangaChapterListProps {
  mangaSlug: string;
  chapters: Chapter[];
}

export default function MangaChapterList({ mangaSlug, chapters }: MangaChapterListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [_isClient, setIsClient] = useState(false);
  const [readChapters, setReadChapters] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const { formatViews, formatDate } = useFormat();
  const t = useTranslations('manga');

  // Limit initial chapters display for better performance
  const INITIAL_CHAPTERS_LIMIT = 20;

  // Set isClient to true after hydration is complete and load reading history
  useEffect(() => {
    setIsClient(true);

    // Lấy lịch sử đọc từ localStorage
    const history = getReadingHistory();

    // Tạo map các chapter đã đọc của manga hiện tại
    const readMap: Record<string, boolean> = {};
    history.forEach(item => {
      if (item.manga.slug === mangaSlug && item.chapter) {
        readMap[item.chapter.slug] = true;
      }
    });

    setReadChapters(readMap);
  }, [mangaSlug]);

  // Filter chapters based on search term
  const filteredChapters = chapters.filter(
    chapter =>
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.number.toString().includes(searchTerm)
  );

  // Sort chapters based on sort order
  const allSortedChapters = [...filteredChapters].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.number - a.number;
    } else {
      return a.number - b.number;
    }
  });

  // Limit chapters display for better performance
  const sortedChapters =
    showAll || searchTerm ? allSortedChapters : allSortedChapters.slice(0, INITIAL_CHAPTERS_LIMIT);

  const hasMoreChapters =
    !showAll && !searchTerm && allSortedChapters.length > INITIAL_CHAPTERS_LIMIT;

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 pt-5'>
        <CardTitle className='text-xl'>{t('chaptersList')}</CardTitle>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className='text-xs'
          >
            <ArrowUpDown className='mr-2 h-3 w-3' />
            {sortOrder === 'newest' ? t('newestFirst') : t('oldestFirst')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4'>
          <Input
            placeholder={t('searchChapters')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='max-w-sm'
          />
        </div>

        <div className='max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
          <div className='grid grid-cols-2 gap-3 pb-5 pr-2'>
            {sortedChapters.length > 0 ? (
              sortedChapters.map(chapter => (
                <LoadingLink
                  key={chapter.id}
                  href={`/manga/${mangaSlug}/${chapter.slug}`}
                  className={cn(
                    'block',
                    'chapter-link', // Class chung cho tất cả chapter link
                    readChapters[chapter.slug] && 'read-chapter' // Class cho chapter đã đọc
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col h-full p-3 rounded-md transition-colors border',
                      readChapters[chapter.slug]
                        ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                        : 'border-border/40 hover:bg-accent'
                    )}
                  >
                    <div className='font-medium mb-2 flex items-center gap-1'>
                      {readChapters[chapter.slug] && (
                        <CheckCircle2 className='h-3 w-3 text-primary' />
                      )}
                      <span className={readChapters[chapter.slug] ? 'text-primary/80' : ''}>
                        {chapter.title}
                      </span>
                    </div>
                    <div className='mt-auto flex flex-col gap-1 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Eye className='h-3 w-3' />
                        <span>{formatViews(chapter.views)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>{formatDate(chapter.releaseDate)}</span>
                      </div>
                    </div>
                  </div>
                </LoadingLink>
              ))
            ) : (
              <div className='col-span-2 md:col-span-4 text-center py-4 text-muted-foreground'>
                {t('noChaptersFound', { searchTerm })}
              </div>
            )}
          </div>

          {/* Show More Button */}
          {hasMoreChapters && (
            <div className='text-center pt-4'>
              <Button
                variant='outline'
                onClick={() => setShowAll(true)}
                className='w-full max-w-sm'
              >
                {t('showAllChapters', { count: allSortedChapters.length - INITIAL_CHAPTERS_LIMIT })}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

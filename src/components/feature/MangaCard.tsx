'use client';

import LoadingLink from '@/components/ui/LoadingLink';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Eye } from 'lucide-react';
import { useFormat } from '@/hooks/useFormat';
import { useTranslations } from 'next-intl';
import { useEffect, useState, memo, useMemo } from 'react';

interface MangaCardProps {
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
  latestChapterSlug?: string;
  genres?: string[];
  rating?: number;
  views?: number;
  chapterCount?: number;
  updatedAt?: string;
  status?: string;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  imageSizes?: string;
  loading?: 'lazy' | 'eager';
}

const MangaCard = memo(function MangaCard({
  title,
  coverImage,
  slug,
  latestChapter,
  latestChapterSlug,
  rating = 0,
  views = 0,
  chapterCount = 0,
  updatedAt,
  status,
  priority = false,
  fetchPriority = 'auto',
  imageSizes = '(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw',
  loading = 'lazy',
}: MangaCardProps) {
  const { formatViews, formatDate } = useFormat();
  const t = useTranslations('manga');

  // State để xử lý hydration mismatch
  const [isClient, setIsClient] = useState(false);

  // Memoize expensive calculations
  const displayRating = useMemo(() => {
    return rating && rating > 0 ? rating : 8;
  }, [rating]);

  // Memoize formatted views to prevent unnecessary recalculations
  const formattedViews = useMemo(() => {
    return formatViews(views);
  }, [formatViews, views]);

  // Chỉ format date sau khi component mount trên client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className='group'>
      <Card className='overflow-hidden h-full transition-all hover:shadow-md border-border/40 bg-card/50'>
        <LoadingLink href={`/manga/${slug}`} className='block'>
          {/* Ảnh bìa manga ở phía trên với kích thước cố định */}
          <div className='relative w-full h-[220px] lg:h-[200px] xl:h-[200px] overflow-hidden'>
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes={imageSizes}
              className='object-cover transition-transform group-hover:scale-105'
              priority={priority}
              fetchPriority={fetchPriority}
              loading={loading}
              quality={85}
              placeholder='blur'
              blurDataURL='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
            />
            {/* Số chapter ở góc phải dưới ảnh bìa */}
            {chapterCount > 0 && (
              <div className='absolute bottom-0 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded-tl'>
                {t('chaptersCount', { count: chapterCount })}
              </div>
            )}
          </div>
        </LoadingLink>

        <CardContent className='p-3 space-y-2'>
          {/* Tiêu đề manga với font chữ đậm và kích thước lớn */}
          <LoadingLink href={`/manga/${slug}`} className='block'>
            <h3 className='font-bold text-base line-clamp-1 hover:text-primary transition-colors'>
              {title}
            </h3>
          </LoadingLink>

          {/* Dòng thông tin với biểu tượng sao và mắt */}
          <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
            <div className='flex items-center'>
              <Star className='h-4 w-4 fill-yellow-500 text-yellow-500 mr-1' />
              <span>{displayRating.toFixed(1)}</span>
            </div>
            <div className='flex items-center'>
              <Eye className='h-4 w-4 mr-1' />
              <span>{formattedViews}</span>
            </div>
          </div>

          {/* Chapter và thời gian ở dưới cùng */}
          <div className='flex flex-col space-y-1 text-xs text-muted-foreground pt-1'>
            <div className='flex items-center justify-between'>
              {latestChapter ? (
                <div className='px-2 py-1 bg-secondary rounded-full whitespace-nowrap'>
                  {latestChapterSlug ? (
                    <LoadingLink
                      href={`/manga/${slug}/${latestChapterSlug}`}
                      className='font-medium hover:text-primary transition-colors block truncate'
                      aria-label={`Xem ${latestChapter} của ${title}`}
                      title={latestChapter}
                    >
                      {latestChapter}
                    </LoadingLink>
                  ) : (
                    <LoadingLink
                      href={`/manga/${slug}#latest-chapter`}
                      className='font-medium hover:text-primary transition-colors block truncate'
                      aria-label={`Xem ${latestChapter} của ${title}`}
                      title={latestChapter}
                    >
                      {latestChapter}
                    </LoadingLink>
                  )}
                </div>
              ) : (
                <div className='px-2 py-1 bg-secondary rounded-full'>
                  <span className='font-medium'>{t('updating')}</span>
                </div>
              )}
              {updatedAt && (
                <span
                  className='text-muted-foreground/80 text-[11px] whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis'
                  title={isClient ? formatDate(updatedAt) : ''}
                >
                  {isClient ? formatDate(updatedAt) : '...'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default MangaCard;

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Eye } from 'lucide-react';
import { FavoriteButton } from '@/components/manga/FavoriteButton';
import { useFormat } from '@/hooks/useFormat';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface MangaCardProps {
  id: string;
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
  showFavoriteButton?: boolean;
  initialIsFavorite?: boolean;
}

export default function MangaCard({
  id,
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
  showFavoriteButton = false,
  initialIsFavorite = false,
}: MangaCardProps) {
  const { formatViews, formatDate } = useFormat();
  const t = useTranslations('manga');

  // State để xử lý hydration mismatch
  const [isClient, setIsClient] = useState(false);

  // Hiển thị rating = 8 nếu không có rating thật (0 hoặc null/undefined)
  const displayRating = rating && rating > 0 ? rating : 8;

  // Chỉ format date sau khi component mount trên client
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className='group'>
      <Card className='overflow-hidden h-full transition-all hover:shadow-md border-border/40 bg-card/50'>
        <Link href={`/manga/${slug}`} className='block'>
          {/* Ảnh bìa manga ở phía trên với kích thước cố định */}
          <div className='relative w-full h-[280px] lg:h-[200px] xl:h-[200px] overflow-hidden'>
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              className='object-cover transition-transform group-hover:scale-105'
            />
            {/* Trạng thái manga ở góc trái trên ảnh bìa */}
            {status && (
              <div className='absolute top-0 left-0 bg-primary text-primary-foreground text-xs py-1 px-2 rounded-br'>
                {status}
              </div>
            )}

            {/* Favorite button ở góc phải trên */}
            {showFavoriteButton && (
              <div className='absolute top-2 right-2 z-10' onClick={(e) => e.stopPropagation()}>
                <FavoriteButton
                  comicId={parseInt(id)}
                  initialIsFavorite={initialIsFavorite}
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70"
                />
              </div>
            )}

            {/* Số chapter ở góc phải dưới ảnh bìa */}
            {chapterCount > 0 && (
              <div className='absolute bottom-0 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded-tl'>
                {t('chaptersCount', { count: chapterCount })}
              </div>
            )}
          </div>
        </Link>

        <CardContent className='p-3 space-y-2'>
          {/* Tiêu đề manga với font chữ đậm và kích thước lớn */}
          <Link href={`/manga/${slug}`} className='block'>
            <h3 className='font-bold text-base line-clamp-1 hover:text-primary transition-colors'>{title}</h3>
          </Link>

          {/* Dòng thông tin với biểu tượng sao và mắt */}
          <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
            <div className='flex items-center'>
              <Star className='h-4 w-4 fill-yellow-500 text-yellow-500 mr-1' />
              <span>{displayRating.toFixed(1)}</span>
            </div>
            <div className='flex items-center'>
              <Eye className='h-4 w-4 mr-1' />
              <span>{formatViews(views)}</span>
            </div>
          </div>

          {/* Chapter và thời gian ở dưới cùng */}
          <div className='flex flex-col space-y-1 text-xs text-muted-foreground pt-1'>
            <div className='flex items-center justify-between'>
              {latestChapter ? (
                <div className='px-2 py-1 bg-secondary rounded-full whitespace-nowrap'>
                  {latestChapterSlug ? (
                    <Link
                      href={`/manga/${slug}/${latestChapterSlug}`}
                      className='font-medium hover:text-primary transition-colors block truncate'
                      aria-label={`Xem ${latestChapter} của ${title}`}
                      title={latestChapter}
                    >
                      {latestChapter}
                    </Link>
                  ) : (
                    <Link
                      href={`/manga/${slug}#latest-chapter`}
                      className='font-medium hover:text-primary transition-colors block truncate'
                      aria-label={`Xem ${latestChapter} của ${title}`}
                      title={latestChapter}
                    >
                      {latestChapter}
                    </Link>
                  )}
                </div>
              ) : (
                <div className='px-2 py-1 bg-secondary rounded-full'>
                  <span className='font-medium'>{t('updating')}</span>
                </div>
              )}
              {updatedAt && (
                <span className='text-muted-foreground/80 text-[11px] whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis' title={isClient ? formatDate(updatedAt) : ''}>
                  {isClient ? formatDate(updatedAt) : '...'}
                </span>
              )}
              {!updatedAt && (
                <span className='text-muted-foreground/80 text-[11px] whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis'>
                  {t('updating')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

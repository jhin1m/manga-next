'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Eye } from 'lucide-react';
import { formatViews } from '@/lib/utils/format';

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
}

export default function MangaCard({
  id,
  title,
  coverImage,
  slug,
  latestChapter,
  latestChapterSlug,
  genres = [],
  rating = 0,
  views = 0,
  chapterCount = 0,
  updatedAt,
  status,
}: MangaCardProps) {
  // Sử dụng hàm formatViews từ thư viện utils

  return (
    <div className='group'>
      <Card className='overflow-hidden h-full transition-all hover:shadow-md border-border/40 bg-card/50'>
        <Link href={`/manga/${slug}`} className='block'>
          {/* Ảnh bìa manga ở phía trên với kích thước cố định */}
          <div className='relative w-full h-[280px] overflow-hidden'>
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
            
            {/* Số chapter ở góc phải dưới ảnh bìa */}
            {chapterCount > 0 && (
              <div className='absolute bottom-0 right-0 bg-black/70 text-white text-xs py-1 px-2 rounded-tl'>
                {chapterCount} chapters
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
              <span>{rating.toFixed(1)}</span>
            </div>
            <div className='flex items-center'>
              <Eye className='h-4 w-4 mr-1' />
              <span>{formatViews(views)}</span>
            </div>
          </div>

          {/* Chapter và thời gian ở dưới cùng - đặt trong cùng 1 viên thuốc */}
          <div className='flex flex-col space-y-1 text-xs text-muted-foreground pt-1'>
            <div className='inline-flex px-2 py-1 bg-secondary rounded-full'>
              {latestChapter ? (
                <>
                  {latestChapterSlug ? (
                    <Link 
                      href={`/manga/${slug}/${latestChapterSlug}`}
                      className='font-medium hover:text-primary transition-colors'
                      aria-label={`Xem ${latestChapter} của ${title}`}
                    >
                      {latestChapter}
                    </Link>
                  ) : (
                    <Link 
                      href={`/manga/${slug}#latest-chapter`}
                      className='font-medium hover:text-primary transition-colors'
                      aria-label={`Xem ${latestChapter} của ${title}`}
                    >
                      {latestChapter}
                    </Link>
                  )}
                  {updatedAt && (
                    <>
                      <span className='mx-1'>•</span>
                      <span>{updatedAt}</span>
                    </>
                  )}
                </>
              ) : (
                <span className='font-medium'>Updating</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

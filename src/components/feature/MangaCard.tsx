'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface MangaCardProps {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
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
  genres = [],
  rating = 0,
  views = 0,
  chapterCount = 0,
  updatedAt,
  status,
}: MangaCardProps) {
  // Format view count (e.g., 1200 -> 1.2K)
  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <Link href={`/manga/${slug}`} className='block group'>
      <Card className='overflow-hidden h-full transition-all hover:shadow-md border-border/40 bg-card/50'>
        <div className='relative aspect-[2/3] w-full overflow-hidden'>
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover transition-transform group-hover:scale-105'
          />
          {status && (
            <div className='absolute top-0 left-0 bg-primary text-primary-foreground text-xs py-1 px-2 rounded-br'>
              {status}
            </div>
          )}
          {latestChapter && (
            <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2'>
              {latestChapter}
            </div>
          )}
        </div>
        <CardContent className='p-2'>
          <h3 className='font-medium line-clamp-1 text-sm'>{title}</h3>

          {/* Rating and Views */}
          <div className='flex items-center justify-between mt-1 text-xs text-muted-foreground'>
            <div className='flex items-center'>
              <Star className='h-3 w-3 fill-yellow-500 text-yellow-500 mr-1' />
              <span>{rating.toFixed(1)}</span>
            </div>
            <div>{formatViews(views)} views</div>
          </div>

          {/* Chapter count and update time */}
          <div className='flex items-center justify-between mt-1 text-xs text-muted-foreground'>
            <div>{chapterCount} chapters</div>
            {updatedAt && <div>{updatedAt}</div>}
          </div>
        </CardContent>

        {genres.length > 0 && (
          <CardFooter className='p-2 pt-0 flex flex-wrap gap-1'>
            {genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className='text-xs'>
                {genre}
              </Badge>
            ))}
            {genres.length > 2 && (
              <Badge variant="outline" className='text-xs'>
                +{genres.length - 2}
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}

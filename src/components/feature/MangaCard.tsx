'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MangaCardProps {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
  genres?: string[];
}

export default function MangaCard({
  id,
  title,
  coverImage,
  slug,
  latestChapter,
  genres = [],
}: MangaCardProps) {
  return (
    <Link href={`/manga/${slug}`} className='block group'>
      <Card className='overflow-hidden h-full transition-all hover:shadow-md'>
        <div className='relative aspect-[2/3] w-full overflow-hidden'>
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover transition-transform group-hover:scale-105'
          />
          {latestChapter && (
            <div className='absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2'>
              {latestChapter}
            </div>
          )}
        </div>
        <CardContent className='p-3'>
          <h3 className='font-medium line-clamp-2 text-sm'>{title}</h3>
        </CardContent>
        {genres.length > 0 && (
          <CardFooter className='p-3 pt-0 flex flex-wrap gap-1'>
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

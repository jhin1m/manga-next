'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { formatViews } from '@/lib/utils/format';

interface RelatedMangaItemProps {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
  views?: number;
}

export default function RelatedMangaItem({
  title,
  coverImage,
  slug,
  latestChapter,
  views = 0,
}: RelatedMangaItemProps) {


  return (
    <Link href={`/manga/${slug}`} className="block group">
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
        {/* Small thumbnail */}
        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        
        {/* Manga info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
          {latestChapter && (
            <div className="text-xs text-muted-foreground mt-1">{latestChapter}</div>
          )}
          {views > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Eye className="h-3 w-3" />
              <span>{formatViews(views)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

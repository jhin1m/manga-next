'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';

interface RelatedMangaItemProps {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter?: string;
  views?: number;
}

export default function RelatedMangaItem({
  id,
  title,
  coverImage,
  slug,
  latestChapter,
  views = 0,
}: RelatedMangaItemProps) {
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

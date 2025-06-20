'use client';

import RelatedMangaItem from '@/components/manga/RelatedMangaItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface MangaData {
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

interface RelatedMangaProps {
  relatedManga: MangaData[];
}

export default function RelatedManga({ relatedManga }: RelatedMangaProps) {
  const t = useTranslations('manga');

  return (
    <Card>
      <CardHeader className='pb-2 pt-4'>
        <CardTitle className='text-xl'>{t('youMayAlsoLike')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-1 px-4'>
        {relatedManga.map(manga => (
          <RelatedMangaItem
            key={manga.id}
            id={manga.id}
            title={manga.title}
            coverImage={manga.coverImage}
            slug={manga.slug}
            latestChapter={manga.latestChapter}
            views={manga.views}
          />
        ))}
      </CardContent>
    </Card>
  );
}

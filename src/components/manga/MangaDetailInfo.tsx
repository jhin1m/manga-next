'use client';

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, BookOpen, Heart } from "lucide-react";
import { FavoriteButton } from "@/components/manga/FavoriteButton";
import { StarRating } from "@/components/manga/StarRating";
import { useTranslations } from 'next-intl';
import { useFormat } from '@/hooks/useFormat';

interface MangaDetailInfoProps {
  manga: {
    id: number;
    title: string;
    alternativeTitles: string[];
    coverImage: string;
    slug: string;
    author: string;
    artist: string;
    genres: { name: string; slug: string }[];
    status: string;
    views: number;
    favorites: number;
    chapterCount: number;
    updatedAt: string | null;
    publishedYear: string | number;
    serialization: string;
  };
  chapters: Array<{
    id: string;
    slug: string;
    number: number;
    title: string;
  }>;
}

export function MangaDetailInfo({ manga, chapters }: MangaDetailInfoProps) {
  const t = useTranslations('manga');
  const { formatDate, formatViews } = useFormat();

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-14">
      {/* Cover Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
        <Image
          src={manga.coverImage}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Manga Details */}
      <div className="md:col-span-3 space-y-4">
        <h1 className="text-3xl font-bold">{manga.title}</h1>

        {manga.alternativeTitles && manga.alternativeTitles.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t('alternativeTitles')}: {manga.alternativeTitles.join(", ")}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {manga.genres.map((genre: { name: string; slug: string }) => (
            <Badge key={genre.slug} variant="secondary" asChild>
              <Link
                href={`/genres/${genre.slug}`}
                className="cursor-pointer transition-colors hover:bg-secondary/80"
              >
                {genre.name}
              </Link>
            </Badge>
          ))}
        </div>

        {/* Interactive Star Rating */}
        <div className="py-2">
          <StarRating
            mangaId={manga.id}
            mangaSlug={manga.slug}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatViews(manga.views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{manga.chapterCount} {t('chapters')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{formatViews(manga.favorites)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('status')}:</span>{" "}
            <span className="font-medium">{manga.status}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('author')}:</span>{" "}
            <span className="font-medium">{manga.author}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('artist')}:</span>{" "}
            <span className="font-medium">{manga.artist}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('published')}:</span>{" "}
            <span className="font-medium">{manga.publishedYear}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('serialization')}:</span>{" "}
            <span className="font-medium">{manga.serialization}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('updated')}:</span>{" "}
            <span className="font-medium">
              {manga.updatedAt ? formatDate(manga.updatedAt) : t('updating')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/manga/${manga.slug}/${chapters.length > 0 ? chapters[chapters.length - 1].slug : '#'}`}>
              {t('readFirstChapter')}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/manga/${manga.slug}/${chapters.length > 0 ? chapters[0].slug : '#'}`}>
              {t('readLatestChapter')}
            </Link>
          </Button>
          <FavoriteButton
            comicId={manga.id}
            variant="outline"
            size="default"
            showText={true}
          />
        </div>
      </div>
    </section>
  );
}

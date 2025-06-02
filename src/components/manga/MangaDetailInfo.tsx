'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, BookOpen, Heart, ChevronDown, ChevronUp } from "lucide-react";
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
    description: string;
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

  // Metadata expand state for responsive
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);

  return (
    <section className="relative">
      {/* Background Image with Blur Effect */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={manga.coverImage}
          alt=""
          fill
          className="object-cover blur-xl scale-110 opacity-15 grayscale"
          priority
        />

      </div>

      {/* Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
        {/* Left Column - Cover + Title + Actions */}
        <div className="col-span-1 lg:col-span-3">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Cover Image */}
            <div className="relative aspect-[2/3] w-40 xs:w-48 sm:w-56 lg:w-64 mx-auto sm:mx-0 flex-shrink-0 overflow-hidden rounded-lg shadow-lg">
              <Image
                src={manga.coverImage}
                alt={manga.title}
                fill
                sizes="(max-width: 480px) 160px, (max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                className="object-cover"
                priority
              />
            </div>
            {/* Title + Action Buttons */}
            <div className="flex-1 flex flex-col text-center sm:text-left space-y-3 sm:space-y-4">
              {/* Status Label - Mobile/Tablet hidden, Desktop visible */}
              <div className="hidden lg:block text-sm text-muted-foreground font-medium tracking-wider uppercase">
                {manga.status}
              </div>

              {/* Title Section */}
              <div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {manga.title}
                </h1>
                {manga.alternativeTitles && manga.alternativeTitles.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                    {manga.alternativeTitles.join("; ")}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row lg:flex-row gap-2 sm:gap-3">
                <Button asChild size="default" className="flex-1 lg:flex-none lg:w-auto text-xs sm:text-sm">
                  <Link href={`/manga/${manga.slug}/${chapters.length > 0 ? chapters[chapters.length - 1].slug : '#'}`}>
                    <span>{t('readFirstChapter')} ▶</span>
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="default" className="flex-1 lg:flex-none lg:w-auto text-xs sm:text-sm">
                  <Link href={`/manga/${manga.slug}/${chapters.length > 0 ? chapters[0].slug : '#'}`}>
                    <span>{t('readLatestChapter')}</span>
                  </Link>
                </Button>
                <FavoriteButton
                  comicId={manga.id}
                  variant="outline"
                  size="default"
                  showText={true}
                  className="flex-1 lg:flex-none lg:w-auto text-xs sm:text-sm"
                />
              </div>

              {/* Stats - Desktop only */}
              <div className="hidden lg:block">
                <div className="flex items-center gap-4 lg:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{formatViews(manga.views)} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{manga.chapterCount} chapters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span>{formatViews(manga.favorites)} favorites</span>
                  </div>
                </div>
              </div>

              {/* Description Section - Desktop with Dialog */}
              {manga.description && (
                <div className="hidden lg:block">
                  <h3 className="text-lg font-semibold mb-3">{t('synopsis')}</h3>
                  <div className="text-sm text-muted-foreground">
                    <span>{manga.description.slice(0, 150)}...</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-primary underline underline-offset-4 ml-1 hover:text-primary/80 transition-colors">
                          {t('showMore') || 'Show More'}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t('synopsis')}</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground whitespace-pre-line mt-4">
                          {manga.description}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="col-span-1 lg:col-span-1 space-y-3 sm:space-y-4 mt-4 sm:mt-12">
          {/* Always visible sections */}
          {/* Description Section - Mobile/Tablet only */}
          {manga.description && (
            <div className="lg:hidden">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center">{t('synopsis')}</h3>
              <div className="text-xs sm:text-sm text-muted-foreground text-center">
                <span>{manga.description.slice(0, 150)}...</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-primary underline underline-offset-4 ml-1 hover:text-primary/80 transition-colors">
                      {t('showMore') || 'Show More'}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('synopsis')}</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground whitespace-pre-line mt-4">
                      {manga.description}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* Expandable Details Section */}
          <div className="lg:space-y-3 transition-all duration-300 ease-in-out">
            {/* Details Header - Mobile/Tablet only */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Details</span>
                {isMetadataExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Expandable Content */}
            <div className={`
              space-y-3 sm:space-y-4
              lg:block lg:opacity-100 lg:max-h-none
              overflow-hidden transition-all duration-300 ease-in-out
              ${isMetadataExpanded
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0 lg:opacity-100 lg:max-h-none'
              }
            `}>
              {/* Genres */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center lg:justify-start">
                {manga.genres.map((genre: { name: string; slug: string }) => (
                  <Badge key={genre.slug} variant="secondary" asChild className="text-xs">
                    <Link
                      href={`/genres/${genre.slug}`}
                      className="cursor-pointer transition-colors hover:bg-secondary/80"
                    >
                      {genre.name}
                    </Link>
                  </Badge>
                ))}
              </div>

              {/* Stats - Single Row */}
              <div className="lg:hidden flex items-center justify-center gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>{formatViews(manga.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>{manga.chapterCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>{formatViews(manga.favorites)}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-center lg:text-left">
                {manga.author && (
                  <div>
                    <span className="text-muted-foreground">Author:</span>{" "}
                    <span className="font-medium">{manga.author}</span>
                  </div>
                )}
                {manga.artist && (
                  <div>
                    <span className="text-muted-foreground">Artist:</span>{" "}
                    <span className="font-medium">{manga.artist}</span>
                  </div>
                )}
                {manga.status && (
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span className="font-medium">{manga.status}</span>
                  </div>
                )}
                {manga.publishedYear && (
                  <div>
                    <span className="text-muted-foreground">Published:</span>{" "}
                    <span className="font-medium">{manga.publishedYear}</span>
                  </div>
                )}
                {manga.serialization && (
                  <div>
                    <span className="text-muted-foreground">Serialization:</span>{" "}
                    <span className="font-medium">{manga.serialization}</span>
                  </div>
                )}
                {manga.updatedAt && (
                  <div>
                    <span className="text-muted-foreground">Updated:</span>{" "}
                    <span className="font-medium">
                      {formatDate(manga.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex justify-center lg:justify-start py-1">
                <div className="border border-border rounded-lg p-3 bg-card/50 backdrop-blur-sm">
                  <StarRating
                    mangaId={manga.id}
                    mangaSlug={manga.slug}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

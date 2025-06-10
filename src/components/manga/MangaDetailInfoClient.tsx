"use client";

import { useState, useEffect } from 'react';
import { MangaDetailInfo } from "@/components/manga/MangaDetailInfo";
import { AnimatedMangaDetailSkeleton } from "@/components/ui/skeletons/AnimatedMangaSkeleton";

interface MangaDetailInfoClientProps {
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
    number: number;
    title: string;
    slug: string;
    releaseDate: string;
    views: number;
  }>;
  showLoadingEffect?: boolean;
}

export default function MangaDetailInfoClient({ 
  manga, 
  chapters, 
  showLoadingEffect = true 
}: MangaDetailInfoClientProps) {
  const [isLoading, setIsLoading] = useState(showLoadingEffect);

  useEffect(() => {
    if (showLoadingEffect) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [showLoadingEffect]);

  if (isLoading) {
    return <AnimatedMangaDetailSkeleton />;
  }

  return <MangaDetailInfo manga={manga} chapters={chapters} />;
}

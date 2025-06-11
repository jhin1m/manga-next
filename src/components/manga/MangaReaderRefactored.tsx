'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReaderNavigation from "./ReaderNavigation";
import CommentSection from "@/components/feature/comments/CommentSection";
import { ChapterReportButton } from "@/components/feature/chapter-reports/ChapterReportButton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useImageLoading } from "@/hooks/useImageLoading";
import { useReaderProgress } from "@/hooks/useReaderProgress";
import ReaderImage from "./ReaderImage";
import ReaderControls from "./ReaderControls";
import { useTranslations } from 'next-intl';

interface MangaReaderProps {
  chapterData: {
    manga: {
      id: string;
      title: string;
      slug: string;
      cover_image_url: string;
    };
    chapter: {
      id: string;
      number: number;
      title: string;
      slug?: string;
      images: string[];
    };
    navigation: {
      prevChapter: string | null;
      nextChapter: string | null;
      totalChapters: number;
    };
    chapters?: Array<{
      id: string;
      number: number;
      title?: string;
      slug?: string;
    }>;
  };
}

/**
 * Refactored MangaReader component using custom hooks and smaller components
 * Significantly reduced complexity and improved performance
 */
export default function MangaReaderRefactored({ chapterData }: MangaReaderProps) {
  // Translations
  const t = useTranslations('reader');

  // State for reader settings
  const [brightness] = useLocalStorage('manga-brightness', 100);

  // Configuration
  const DEFAULT_PLACEHOLDER_HEIGHT = 800;
  const WEBTOON_ASPECT_RATIO = 0.7;

  // State for placeholder height
  const [placeholderHeight, setPlaceholderHeight] = useState(DEFAULT_PLACEHOLDER_HEIGHT);

  // Custom hooks for separated concerns
  const {
    imageStates,
    loadImage,
    imageRefs,
  } = useImageLoading(chapterData.chapter.images, {
    preloadCount: 3,
    maxSimultaneousLoads: 3,
    triggerDistance: 200,
  });

  const {
    currentPage,
    readingProgress,
    updateProgress,
  } = useReaderProgress(
    chapterData.manga.id,
    chapterData.chapter.id,
    { totalImages: chapterData.chapter.images.length }
  );

  // Calculate placeholder height based on viewport width and webtoon aspect ratio
  const getPlaceholderHeight = useCallback(() => {
    if (typeof window !== 'undefined') {
      const viewportWidth = window.innerWidth;
      const maxWidth = Math.min(viewportWidth, 1024); // Max container width (5xl = 1024px)
      const calculatedHeight = maxWidth / WEBTOON_ASPECT_RATIO;
      // Use calculated height but cap it at reasonable bounds
      return Math.min(Math.max(calculatedHeight, 600), 1200);
    }
    return DEFAULT_PLACEHOLDER_HEIGHT;
  }, [WEBTOON_ASPECT_RATIO, DEFAULT_PLACEHOLDER_HEIGHT]);

  // Update placeholder height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      setPlaceholderHeight(getPlaceholderHeight());
    };

    updateHeight(); // Set initial height
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [getPlaceholderHeight]);

  // Handle image ref assignment
  const handleImageRef = useCallback((index: number, element: HTMLElement | null) => {
    imageRefs.current[index] = element;
  }, [imageRefs]);

  // Handle reading progress updates based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate current page based on scroll position
      const scrollProgress = (scrollTop + windowHeight) / documentHeight;
      const estimatedPage = Math.ceil(scrollProgress * chapterData.chapter.images.length);
      
      updateProgress(estimatedPage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterData.chapter.images.length, updateProgress]);

  // Use reading history hook
  useReadingHistory({
    mangaId: chapterData.manga.id,
    mangaTitle: chapterData.manga.title,
    mangaSlug: chapterData.manga.slug,
    coverImage: chapterData.manga.cover_image_url || '',
    chapterId: chapterData.chapter.id,
    chapterTitle: chapterData.chapter.title,
    chapterNumber: chapterData.chapter.number,
    chapterSlug: chapterData.chapter.slug,
  });

  // Prepare chapters data for dropdown
  const chapters = chapterData.chapters || [
    {
      id: chapterData.chapter.id,
      number: chapterData.chapter.number,
      title: chapterData.chapter.title,
      slug: chapterData.chapter.slug
    }
  ];

  return (
    <div
      className="min-h-screen bg-black"
      style={{
        filter: `brightness(${brightness}%)`,
      }}
    >
      {/* Top Navigation Bar - Sticky */}
      <ReaderNavigation
        mangaTitle={chapterData.manga.title}
        mangaSlug={chapterData.manga.slug}
        currentChapterId={chapterData.chapter.id}
        currentChapterTitle={chapterData.chapter.title}
        prevChapter={chapterData.navigation.prevChapter}
        nextChapter={chapterData.navigation.nextChapter}
        chapters={chapters}
        comicId={parseInt(chapterData.manga.id)}
      />

      {/* Reader Content */}
      <main className="pt-2 pb-16">
        {/* Vertical scrolling mode */}
        <div className="flex flex-col items-center w-full sm:max-w-5xl sm:mx-auto">
          {chapterData.chapter.images.map((image, index) => {
            const imageState = imageStates[index];
            if (!imageState) return null;

            return (
              <ReaderImage
                key={index}
                src={image}
                alt={t('pageAlt', { number: index + 1 })}
                index={index}
                imageState={imageState}
                placeholderHeight={placeholderHeight}
                onRetry={loadImage}
                onRef={handleImageRef}
              />
            );
          })}

          {/* End of chapter section */}
          <div className="w-full py-8 flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              {t('endOfChapter', { number: chapterData.chapter.number })}
            </p>

            <div className="flex gap-2">
              {chapterData.navigation.prevChapter && (
                <Button asChild variant="outline">
                  <Link href={`/manga/${chapterData.manga.slug}/${chapterData.navigation.prevChapter}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('previousChapter')}
                  </Link>
                </Button>
              )}

              {chapterData.navigation.nextChapter && (
                <Button asChild variant="outline">
                  <Link href={`/manga/${chapterData.manga.slug}/${chapterData.navigation.nextChapter}`}>
                    {t('nextChapter')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Report Chapter Button */}
            <div className="mt-4">
              <ChapterReportButton
                chapterId={parseInt(chapterData.chapter.id)}
                chapterTitle={chapterData.chapter.title}
                mangaTitle={chapterData.manga.title}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Controls */}
      <ReaderControls
        mangaSlug={chapterData.manga.slug}
        prevChapter={chapterData.navigation.prevChapter}
        nextChapter={chapterData.navigation.nextChapter}
        currentProgress={readingProgress}
        totalImages={chapterData.chapter.images.length}
      />

      {/* Comment Section */}
      <div className="bg-background">
        <div className="w-full sm:max-w-5xl sm:mx-auto px-4 py-8">
          <CommentSection
            mangaId={parseInt(chapterData.manga.id)}
            chapterId={parseInt(chapterData.chapter.id)}
            mangaSlug={chapterData.manga.slug}
            chapterSlug={chapterData.chapter.slug}
          />
        </div>
      </div>
    </div>
  );
}

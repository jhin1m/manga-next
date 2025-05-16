'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Home,
  List,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Minimize,
  SunMedium,
  Moon,
  BookOpen,
  ScrollText,
  Columns
} from 'lucide-react';
import ReaderNavigation from './ReaderNavigation';
import ReaderSettings from './ReaderSettings';
import { cn } from '@/lib/utils';

interface MangaReaderProps {
  chapterData: {
    manga: {
      id: string;
      title: string;
      slug: string;
    };
    chapter: {
      id: string;
      number: number;
      title: string;
      images: string[];
    };
    navigation: {
      prevChapter: string | null;
      nextChapter: string | null;
      totalChapters: number;
    };
  };
}

type ReadingMode = 'vertical' | 'pagination';

export default function MangaReader({ chapterData }: MangaReaderProps) {
  // State for reader settings
  const [readingMode, setReadingMode] = useLocalStorage<ReadingMode>('manga-reading-mode', 'vertical');
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useLocalStorage('manga-brightness', 100);
  const [showSettings, setShowSettings] = useState(false);

  const readerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readingMode === 'pagination') {
        if (e.key === 'ArrowRight' || e.key === 'd') {
          handleNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
          handlePrevPage();
        }
      }

      // Toggle controls with Escape key
      if (e.key === 'Escape') {
        setShowControls(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, currentPage]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Navigation functions
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else if (chapterData.navigation.prevChapter) {
      // Navigate to previous chapter's last page
      router.push(`/manga/${chapterData.manga.slug}/${chapterData.navigation.prevChapter}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < chapterData.chapter.images.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (chapterData.navigation.nextChapter) {
      // Navigate to next chapter
      router.push(`/manga/${chapterData.manga.slug}/${chapterData.navigation.nextChapter}`);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      readerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Calculate reading progress
  const progress = Math.round(((currentPage + 1) / chapterData.chapter.images.length) * 100);

  return (
    <div
      ref={readerRef}
      className="relative min-h-screen bg-black"
      style={{
        filter: `brightness(${brightness}%)`,
      }}
      onClick={() => setShowControls(prev => !prev)}
    >
      {/* Top Navigation Bar */}
      {showControls && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm p-2 transition-all duration-300">
          <ReaderNavigation
            mangaTitle={chapterData.manga.title}
            chapterTitle={chapterData.chapter.title}
            mangaSlug={chapterData.manga.slug}
            prevChapter={chapterData.navigation.prevChapter}
            nextChapter={chapterData.navigation.nextChapter}
            currentPage={currentPage + 1}
            totalPages={chapterData.chapter.images.length}
            onSettingsClick={() => setShowSettings(prev => !prev)}
          />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <ReaderSettings
          readingMode={readingMode}
          setReadingMode={setReadingMode}
          brightness={brightness}
          setBrightness={setBrightness}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Reader Content */}
      <div className={cn(
        "pt-16 pb-16", // Space for navigation bars
        readingMode === 'vertical' ? 'reader-vertical' : 'reader-pagination'
      )}>
        {readingMode === 'vertical' ? (
          // Vertical scrolling mode
          <div className="flex flex-col items-center gap-1">
            {chapterData.chapter.images.map((image, index) => (
              <div key={index} className="w-full max-w-5xl mx-auto">
                <Image
                  src={image}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  priority={index < 3}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        ) : (
          // Pagination mode
          <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <Image
              src={chapterData.chapter.images[currentPage]}
              alt={`Page ${currentPage + 1}`}
              width={800}
              height={1200}
              priority
              className="max-h-[calc(100vh-8rem)] w-auto mx-auto"
            />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {showControls && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm p-2 transition-all duration-300">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Progress bar */}
            <div className="w-full flex items-center gap-2">
              {readingMode === 'pagination' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevPage();
                    }}
                    disabled={currentPage === 0 && !chapterData.navigation.prevChapter}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <span className="text-sm">
                    {currentPage + 1} / {chapterData.chapter.images.length}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextPage();
                    }}
                    disabled={currentPage === chapterData.chapter.images.length - 1 && !chapterData.navigation.nextChapter}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="flex-1 mx-4">
                <Slider
                  value={[readingMode === 'pagination' ? currentPage + 1 : progress]}
                  max={readingMode === 'pagination' ? chapterData.chapter.images.length : 100}
                  min={1}
                  step={1}
                  onClick={(e) => e.stopPropagation()}
                  onValueChange={(value) => {
                    if (readingMode === 'pagination') {
                      setCurrentPage(value[0] - 1);
                    }
                  }}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

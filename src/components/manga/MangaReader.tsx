'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReaderNavigation from './ReaderNavigation';
import CommentSection from '@/components/feature/comments/CommentSection';
import { ChapterReportButton } from '@/components/feature/chapter-reports/ChapterReportButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef, useCallback, memo } from 'react';

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

// Không cần ReadingMode vì chỉ sử dụng chế độ đọc dọc

// Image loading states
interface ImageLoadState {
  loaded: boolean;
  loading: boolean;
  error: boolean;
  inView: boolean;
}

// SVG Loading Icon Component with fixed height placeholder
const LoadingIcon = ({ height = 800 }: { height?: number }) => (
  <div
    className='flex items-center justify-center w-full bg-gray-900/50'
    style={{ height: `${height}px` }}
  >
    <svg
      className='animate-spin h-8 w-8 text-white/70'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  </div>
);

const MangaReader = memo(function MangaReader({ chapterData }: MangaReaderProps) {
  // Translations
  const t = useTranslations('reader');

  // State for reader settings
  const [brightness] = useLocalStorage('manga-brightness', 100);

  // Configuration
  const PRELOAD_COUNT = 3;
  const MAX_SIMULTANEOUS_LOADS = 3;
  const TRIGGER_DISTANCE = 200; // pixels before entering viewport
  const DEFAULT_PLACEHOLDER_HEIGHT = 800; // Default height for webtoon images
  const WEBTOON_ASPECT_RATIO = 0.7; // Width/Height ratio for typical webtoon images

  // Lazy loading state
  const [imageStates, setImageStates] = useState<Record<number, ImageLoadState>>({});
  const [loadingQueue, setLoadingQueue] = useState<Set<number>>(new Set());
  const [placeholderHeight, setPlaceholderHeight] = useState(DEFAULT_PLACEHOLDER_HEIGHT);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const loadedImagesRef = useRef<Set<number>>(new Set());

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

  // Initialize image states
  useEffect(() => {
    const initialStates: Record<number, ImageLoadState> = {};
    chapterData.chapter.images.forEach((_, index) => {
      initialStates[index] = {
        loaded: index < PRELOAD_COUNT, // Preload first 3 images
        loading: index < PRELOAD_COUNT,
        error: false,
        inView: false,
      };
    });
    setImageStates(initialStates);
  }, [chapterData.chapter.images, PRELOAD_COUNT]);

  // Load image function
  const loadImage = useCallback(
    (index: number, src: string) => {
      if (loadedImagesRef.current.has(index) || loadingQueue.size >= MAX_SIMULTANEOUS_LOADS) {
        return;
      }

      setLoadingQueue(prev => new Set([...prev, index]));
      setImageStates(prev => ({
        ...prev,
        [index]: { ...prev[index], loading: true, error: false },
      }));

      const img = new Image();
      img.onload = () => {
        loadedImagesRef.current.add(index);
        setImageStates(prev => ({
          ...prev,
          [index]: { ...prev[index], loaded: true, loading: false },
        }));
        setLoadingQueue(prev => {
          const newQueue = new Set(prev);
          newQueue.delete(index);
          return newQueue;
        });
      };

      img.onerror = () => {
        setImageStates(prev => ({
          ...prev,
          [index]: { ...prev[index], loading: false, error: true },
        }));
        setLoadingQueue(prev => {
          const newQueue = new Set(prev);
          newQueue.delete(index);
          return newQueue;
        });
      };

      img.src = src;
    },
    [loadingQueue.size, MAX_SIMULTANEOUS_LOADS]
  );

  // Setup intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          const isIntersecting = entry.isIntersecting;

          setImageStates(prev => ({
            ...prev,
            [index]: { ...prev[index], inView: isIntersecting },
          }));

          if (isIntersecting && !loadedImagesRef.current.has(index)) {
            const src = chapterData.chapter.images[index];
            if (src) {
              loadImage(index, src);
            }
          }
        });
      },
      {
        rootMargin: `${TRIGGER_DISTANCE}px`,
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [chapterData.chapter.images, loadImage, TRIGGER_DISTANCE]);

  // Observe image containers
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    const currentRefs = imageRefs.current; // Capture current refs
    Object.values(currentRefs).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      // Use captured refs to avoid stale closure
      Object.values(currentRefs).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [imageStates]);

  // Preload first images
  useEffect(() => {
    chapterData.chapter.images.slice(0, PRELOAD_COUNT).forEach((src, index) => {
      loadImage(index, src);
    });
  }, [chapterData.chapter.images, PRELOAD_COUNT, loadImage]);

  // Sử dụng hook để tự động lưu lịch sử đọc truyện
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

  // Chuẩn bị dữ liệu cho dropdown chọn chương
  const chapters = chapterData.chapters || [
    {
      id: chapterData.chapter.id,
      number: chapterData.chapter.number,
      title: chapterData.chapter.title,
      slug: chapterData.chapter.slug,
    },
  ];

  return (
    <div
      className='min-h-screen bg-black'
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
      <main className='pt-2 pb-16'>
        {/* Vertical scrolling mode */}
        <div className='flex flex-col items-center w-full sm:max-w-5xl sm:mx-auto'>
          {chapterData.chapter.images.map((image, index) => {
            const imageState = imageStates[index];
            if (!imageState) return null;

            return (
              <div
                key={index}
                className='w-full'
                ref={el => {
                  imageRefs.current[index] = el;
                }}
                data-index={index}
              >
                {imageState.loaded ? (
                  <img
                    src={image}
                    alt={t('pageAlt', { number: index + 1 })}
                    className='w-full h-auto'
                    loading='eager'
                  />
                ) : imageState.error ? (
                  <div
                    className='flex flex-col items-center justify-center w-full bg-gray-900/50 text-white/70'
                    style={{ height: `${placeholderHeight}px` }}
                  >
                    <svg
                      className='h-8 w-8 mb-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span className='text-sm'>Failed to load</span>
                    <button
                      onClick={() => loadImage(index, image)}
                      className='text-xs text-blue-400 hover:text-blue-300 mt-1'
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <LoadingIcon height={placeholderHeight} />
                )}
              </div>
            );
          })}

          {/* Phần cuối chương */}
          <div className='w-full py-8 flex flex-col items-center gap-4'>
            <p className='text-center text-muted-foreground'>
              {t('endOfChapter', { number: chapterData.chapter.number })}
            </p>

            <div className='flex gap-2'>
              {chapterData.navigation.prevChapter && (
                <Button asChild variant='outline'>
                  <Link
                    href={`/manga/${chapterData.manga.slug}/${chapterData.navigation.prevChapter}`}
                  >
                    <ChevronLeft className='h-4 w-4 mr-1' />
                    {t('previousChapter')}
                  </Link>
                </Button>
              )}

              {chapterData.navigation.nextChapter && (
                <Button asChild variant='outline'>
                  <Link
                    href={`/manga/${chapterData.manga.slug}/${chapterData.navigation.nextChapter}`}
                  >
                    {t('nextChapter')}
                    <ChevronRight className='h-4 w-4 ml-1' />
                  </Link>
                </Button>
              )}
            </div>

            {/* Report Chapter Button */}
            <div className='mt-4'>
              <ChapterReportButton
                chapterId={parseInt(chapterData.chapter.id)}
                chapterTitle={chapterData.chapter.title}
                mangaTitle={chapterData.manga.title}
                variant='outline'
                size='sm'
              />
            </div>
          </div>
        </div>
      </main>

      {/* Comment Section */}
      <div className='bg-background'>
        <div className='w-full sm:max-w-5xl sm:mx-auto px-4 py-8'>
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
});

export default MangaReader;

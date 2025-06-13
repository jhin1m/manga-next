'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List
} from 'lucide-react';
import { ChapterReportButton } from '@/components/feature/chapter-reports/ChapterReportButton';
import { FavoriteButton } from '@/components/manga/FavoriteButton';
import HomeNavigationLink from '@/components/navigation/HomeNavigationLink';

interface ReaderNavigationProps {
  mangaTitle: string;
  mangaSlug: string;
  currentChapterId: string;
  currentChapterTitle?: string;
  prevChapter: string | null;
  nextChapter: string | null;
  chapters: Array<{
    id: string;
    number: number;
    title?: string;
    slug?: string; // Thêm slug cho chapter
  }>;
  comicId: number; // Thay thế isFollowing và onToggleFollow bằng comicId
}

export default function ReaderNavigation({
  mangaTitle,
  mangaSlug,
  currentChapterId,
  currentChapterTitle,
  prevChapter,
  nextChapter,
  chapters,
  comicId
}: ReaderNavigationProps) {
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);

  // Theo dõi scroll để thêm hiệu ứng khi sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Xử lý khi thay đổi chương từ dropdown
  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/manga/${mangaSlug}/${e.target.value}`);
  };

  // Tìm slug của chapter hiện tại
  const currentChapter = chapters.find(ch => ch.id === currentChapterId);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      isSticky
        ? 'bg-background/90 backdrop-blur-sm shadow-md'
        : 'bg-background'
    } p-2 border-b w-full`}>
      <div className="flex items-center gap-1 justify-center md:container md:mx-auto overflow-x-auto">
      {/* Nút Home - luôn hiển thị */}
      <HomeNavigationLink className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 flex-shrink-0">
        <Home className="h-5 w-5" />
        <span className="sr-only">Trang chủ</span>
      </HomeNavigationLink>

      {/* Nút Danh sách - luôn hiển thị */}
      <Button asChild variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
        <Link href={`/manga/${mangaSlug}`}>
          <List className="h-5 w-5" />
          <span className="sr-only">Danh sách chương</span>
        </Link>
      </Button>

      {/* Nút Chương trước - luôn hiển thị */}
      <Button
        asChild={!!prevChapter}
        variant="ghost"
        size="icon"
        className="h-9 w-9 flex-shrink-0"
        disabled={!prevChapter}
      >
        {prevChapter ? (
          <Link href={`/manga/${mangaSlug}/${prevChapter}`}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Chương trước</span>
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-5 w-5" />
          </span>
        )}
      </Button>

      {/* Dropdown chọn chương */}
      <select
        className="flex-1 h-9 px-2 rounded bg-background border border-input text-sm max-w-[150px] md:max-w-[250px] truncate"
        value={currentChapter?.slug || currentChapterId}
        onChange={handleChapterChange}
      >
        {chapters.map(chapter => (
          <option key={chapter.id} value={chapter.slug || chapter.id}>
            {chapter.title || `Chapter ${chapter.number}`}
          </option>
        ))}
      </select>

      {/* Nút Chương sau - luôn hiển thị */}
      <Button
        asChild={!!nextChapter}
        variant="ghost"
        size="icon"
        className="h-9 w-9 flex-shrink-0"
        disabled={!nextChapter}
      >
        {nextChapter ? (
          <Link href={`/manga/${mangaSlug}/${nextChapter}`}>
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Chương sau</span>
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-5 w-5" />
          </span>
        )}
      </Button>

      {/* Nút Theo dõi - hiển thị trên cả mobile */}
      <FavoriteButton
        comicId={comicId}
        variant="ghost"
        size="icon"
        className="h-9 w-9 flex-shrink-0"
      />

      {/* Nút Report Chapter - hiển thị trên cả mobile */}
      <ChapterReportButton
        chapterId={parseInt(currentChapterId)}
        chapterTitle={currentChapterTitle}
        mangaTitle={mangaTitle}
        variant="ghost"
        size="icon"
        className="h-9 w-9 flex-shrink-0"
        iconOnly={true}
      />
      </div>
    </header>
  );
}

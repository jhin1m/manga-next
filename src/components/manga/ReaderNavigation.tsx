'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  List,
  Heart
} from 'lucide-react';

interface ReaderNavigationProps {
  mangaTitle: string;
  mangaSlug: string;
  currentChapterId: string;
  prevChapter: string | null;
  nextChapter: string | null;
  chapters: Array<{
    id: string;
    number: number;
    title?: string;
  }>;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export default function ReaderNavigation({
  mangaTitle,
  mangaSlug,
  currentChapterId,
  prevChapter,
  nextChapter,
  chapters,
  isFollowing = false,
  onToggleFollow = () => {}
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

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      isSticky 
        ? 'bg-background/90 backdrop-blur-sm shadow-md' 
        : 'bg-background'
    } p-2 border-b w-full`}>
      <div className="flex items-center gap-1 justify-center md:container md:mx-auto overflow-x-auto">
      {/* Nút Home - luôn hiển thị */}
      <Button asChild variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
        <Link href="/">
          <Home className="h-5 w-5" />
          <span className="sr-only">Trang chủ</span>
        </Link>
      </Button>
      
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
        value={currentChapterId}
        onChange={handleChapterChange}
      >
        {chapters.map(chapter => (
          <option key={chapter.id} value={chapter.id}>
            Chapter {chapter.number}{chapter.title ? `: ${chapter.title}` : ''}
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
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 flex-shrink-0"
        onClick={onToggleFollow}
      >
        {isFollowing ? (
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
        ) : (
          <Heart className="h-5 w-5" />
        )}
        <span className="sr-only">Theo dõi</span>
      </Button>
      </div>
    </header>
  );
}

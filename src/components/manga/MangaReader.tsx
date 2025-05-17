'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ReaderNavigation from './ReaderNavigation';

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
    chapters?: Array<{
      id: string;
      number: number;
      title?: string;
    }>;
  };
}

// Không cần ReadingMode vì chỉ sử dụng chế độ đọc dọc

export default function MangaReader({ chapterData }: MangaReaderProps) {
  // State for reader settings
  const [brightness] = useLocalStorage('manga-brightness', 100);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Xử lý theo dõi truyện
  const handleToggleFollow = () => {
    setIsFollowing(prev => !prev);
    // Ở đây có thể thêm logic lưu trạng thái theo dõi vào database
  };
  
  // Chuẩn bị dữ liệu cho dropdown chọn chương
  const chapters = chapterData.chapters || [
    {
      id: chapterData.chapter.id,
      number: chapterData.chapter.number,
      title: chapterData.chapter.title
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
        prevChapter={chapterData.navigation.prevChapter}
        nextChapter={chapterData.navigation.nextChapter}
        chapters={chapters}
        isFollowing={isFollowing}
        onToggleFollow={handleToggleFollow}
      />

      {/* Reader Content */}
      <main className="pt-2 pb-16">
        {/* Vertical scrolling mode */}
        <div className="flex flex-col items-center gap-1 max-w-5xl mx-auto">
          {chapterData.chapter.images.map((image, index) => (
            <div key={index} className="w-full">
              <Image
                src={image}
                alt={`Page ${index + 1}`}
                width={800}
                height={1200}
                priority={index < 3}
                loading={index < 3 ? "eager" : "lazy"}
                className="w-full h-auto"
              />
            </div>
          ))}
          
          {/* Phần cuối chương */}
          <div className="w-full py-8 flex flex-col items-center gap-4">
            <p className="text-center text-muted-foreground">
              Hết chương {chapterData.chapter.number}
            </p>
            
            <div className="flex gap-2">
              {chapterData.navigation.prevChapter && (
                <Button asChild variant="outline">
                  <Link href={`/manga/${chapterData.manga.slug}/${chapterData.navigation.prevChapter}`}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Chương trước
                  </Link>
                </Button>
              )}
              
              {chapterData.navigation.nextChapter && (
                <Button asChild variant="outline">
                  <Link href={`/manga/${chapterData.manga.slug}/${chapterData.navigation.nextChapter}`}>
                    Chương sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

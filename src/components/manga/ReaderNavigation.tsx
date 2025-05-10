'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Home, 
  List,
  BookOpen
} from 'lucide-react';

interface ReaderNavigationProps {
  mangaTitle: string;
  chapterTitle: string;
  mangaSlug: string;
  prevChapter: string | null;
  nextChapter: string | null;
  currentPage: number;
  totalPages: number;
  onSettingsClick: () => void;
}

export default function ReaderNavigation({
  mangaTitle,
  chapterTitle,
  mangaSlug,
  prevChapter,
  nextChapter,
  currentPage,
  totalPages,
  onSettingsClick
}: ReaderNavigationProps) {
  return (
    <div className="flex items-center justify-between max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon">
          <Link href={`/manga/${mangaSlug}`}>
            <BookOpen className="h-5 w-5" />
            <span className="sr-only">Manga Details</span>
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon">
          <Link href={`/manga/${mangaSlug}`}>
            <List className="h-5 w-5" />
            <span className="sr-only">Chapter List</span>
          </Link>
        </Button>
      </div>
      
      <div className="hidden md:flex flex-col items-center">
        <h1 className="text-sm font-medium">{mangaTitle}</h1>
        <p className="text-xs text-muted-foreground">{chapterTitle}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        
        <Button
          asChild
          variant="ghost"
          size="icon"
          disabled={!prevChapter}
        >
          {prevChapter ? (
            <Link href={`/manga/${mangaSlug}/${prevChapter}`}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous Chapter</span>
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous Chapter</span>
            </span>
          )}
        </Button>
        
        <Button
          asChild
          variant="ghost"
          size="icon"
          disabled={!nextChapter}
        >
          {nextChapter ? (
            <Link href={`/manga/${mangaSlug}/${nextChapter}`}>
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next Chapter</span>
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next Chapter</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

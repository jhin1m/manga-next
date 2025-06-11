'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReaderControlsProps {
  mangaSlug: string;
  prevChapter: string | null;
  nextChapter: string | null;
  currentProgress: number;
  totalImages: number;
}

/**
 * Navigation controls for manga reader
 * Displays chapter navigation and reading progress
 */
const ReaderControls: React.FC<ReaderControlsProps> = memo(({
  mangaSlug,
  prevChapter,
  nextChapter,
  currentProgress,
  totalImages,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 z-50">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Previous Chapter Button */}
        <Button
          asChild={!!prevChapter}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          disabled={!prevChapter}
        >
          {prevChapter ? (
            <Link href={`/manga/${mangaSlug}/${prevChapter}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </span>
          )}
        </Button>

        {/* Progress Indicator */}
        <div className="flex-1 mx-4">
          <div className="text-center text-white/70 text-sm mb-1">
            {currentProgress}% ({Math.ceil(currentProgress * totalImages / 100)} / {totalImages})
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Next Chapter Button */}
        <Button
          asChild={!!nextChapter}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          disabled={!nextChapter}
        >
          {nextChapter ? (
            <Link href={`/manga/${mangaSlug}/${nextChapter}`}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
});

ReaderControls.displayName = 'ReaderControls';

export default ReaderControls;

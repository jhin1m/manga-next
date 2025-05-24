"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { removeFromDatabaseByComicId } from "@/lib/utils/readingHistory";
import { useSession } from "next-auth/react";

interface ReadingProgress {
  user_id: number;
  comic_id: number;
  last_read_chapter_id: number | null;
  updated_at: Date | null;
  Comics: {
    id: number;
    title: string;
    slug: string;
    cover_image_url: string | null;
  };
  Chapters: {
    id: number;
    title: string | null;
    chapter_number: number;
    slug: string;
  } | null;
}

interface ReadingHistoryListProps {
  initialProgress: ReadingProgress[];
}

export default function ReadingHistoryList({ initialProgress }: ReadingHistoryListProps) {
  const [progress, setProgress] = useState(initialProgress);
  const { status } = useSession();

  const handleRemoveItem = async (comicId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Remove from database if authenticated
      if (status === 'authenticated') {
        await removeFromDatabaseByComicId(comicId);
      }

      // Update local state to immediately reflect the change
      setProgress(prev => prev.filter(item => item.comic_id !== comicId));
    } catch (error) {
      console.error('Error removing reading progress:', error);
    }
  };

  if (progress.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reading history found.</p>
          <Link href="/manga" className="text-sm text-primary hover:underline">
            Start reading manga
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {progress.map((item) => (
        <Card key={`${item.user_id}-${item.comic_id}`} className="group relative">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="aspect-[2/3] relative h-20 w-14 overflow-hidden rounded shrink-0">
              <Image
                src={item.Comics.cover_image_url || '/placeholder.png'}
                alt={item.Comics.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{item.Comics.title}</h3>
              {item.Chapters && (
                <p className="text-sm text-muted-foreground truncate">
                  Chapter {item.Chapters.chapter_number}: {item.Chapters.title}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Last read: {item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.Chapters && (
                <Button asChild size="sm">
                  <Link href={`/manga/${item.Comics.slug}/${item.Chapters.slug}`}>
                    Continue
                  </Link>
                </Button>
              )}
              {/* Delete button - Always visible on mobile, hover on desktop */}
              <button
                onClick={(e) => handleRemoveItem(item.comic_id, e)}
                className="p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive
                          opacity-100 md:opacity-0 md:group-hover:opacity-100
                          transition-opacity min-h-[32px] min-w-[32px] flex items-center justify-center
                          touch-manipulation border border-border/50 hover:border-destructive/50"
                aria-label="Remove from reading history"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

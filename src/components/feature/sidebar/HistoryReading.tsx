"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

type ReadingHistory = {
  id: string;
  manga: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
  };
  chapter?: {
    id: string;
    number: number;
    slug: string;
  };
  readAt: string;
};

export default function HistoryReading() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // In a real app, we would fetch from an API or localStorage
        // For now, we'll use mock data
        
        // Check localStorage for reading history
        const storedHistory = localStorage.getItem('readingHistory');
        
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
          setLoading(false);
          return;
        }
        
        // Mock data if no history exists
        const mockHistory: ReadingHistory[] = [
          {
            id: "1",
            manga: {
              id: "manga1",
              title: "One Piece",
              slug: "one-piece",
              coverImage: "https://placehold.co/100x150/png",
            },
            chapter: {
              id: "chapter1",
              number: 1084,
              slug: "one-piece-chapter-1084",
            },
            readAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          },
          {
            id: "2",
            manga: {
              id: "manga2",
              title: "Demon Slayer",
              slug: "demon-slayer",
              coverImage: "https://placehold.co/100x150/png",
            },
            chapter: {
              id: "chapter2",
              number: 205,
              slug: "demon-slayer-chapter-205",
            },
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          },
          {
            id: "3",
            manga: {
              id: "manga3",
              title: "Jujutsu Kaisen",
              slug: "jujutsu-kaisen",
              coverImage: "https://placehold.co/100x150/png",
            },
            chapter: {
              id: "chapter3",
              number: 223,
              slug: "jujutsu-kaisen-chapter-223",
            },
            readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          },
        ];
        
        // Store mock data in localStorage for future use
        localStorage.setItem('readingHistory', JSON.stringify(mockHistory));
        
        setHistory(mockHistory);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reading history:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-16 w-12 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.length > 0 ? (
        history.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-16 w-12 rounded-md overflow-hidden shrink-0">
              <Image
                src={item.manga.coverImage}
                alt={item.manga.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-medium text-sm line-clamp-1">
                <Link href={`/manga/${item.manga.slug}`} className="hover:text-primary">
                  {item.manga.title}
                </Link>
              </h4>
              {item.chapter && (
                <p className="text-xs text-muted-foreground">
                  <Link href={`/manga/${item.manga.slug}/${item.chapter.slug}`} className="hover:text-primary">
                    Chapter {item.chapter.number}
                  </Link>
                </p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(item.readAt)}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">No reading history yet.</p>
          <Link href="/manga" className="text-xs text-primary hover:underline">
            Discover manga to read
          </Link>
        </div>
      )}
    </div>
  );
}

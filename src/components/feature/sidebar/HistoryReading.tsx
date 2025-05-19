"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import { ReadingHistory, getReadingHistory, clearReadingHistory, removeFromReadingHistory } from "@/lib/utils/readingHistory";

export default function HistoryReading() {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Load reading history from localStorage
  const loadHistory = () => {
    try {
      const historyData = getReadingHistory();
      setHistory(historyData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load reading history:", error);
      setLoading(false);
    }
  };

  // Handle clearing all history
  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử đọc truyện?')) {
      clearReadingHistory();
      setHistory([]);
    }
  };

  // Handle removing a single item
  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling to parent links
    removeFromReadingHistory(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    loadHistory();
    
    // Add event listener to update history if it changes in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'manga-reading-history') {
        loadHistory();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
        <>
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={handleClearHistory}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Xóa lịch sử
            </Button>
          </div>
          {history.map((item) => (
            <div key={item.id} className="flex gap-3 group relative">
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
              <button 
                onClick={(e) => handleRemoveItem(item.id, e)}
                className="absolute top-0 right-0 p-1 rounded-full bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Xóa khỏi lịch sử"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">Chưa có lịch sử đọc truyện.</p>
          <Link href="/manga" className="text-xs text-primary hover:underline">
            Khám phá truyện để đọc
          </Link>
        </div>
      )}
    </div>
  );
}

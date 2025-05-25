"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { removeFromReadingHistoryComplete } from "@/lib/utils/readingHistory";
import { useSession } from "next-auth/react";
import { useReadingHistorySync } from "@/hooks/useReadingHistorySync";

export default function HistoryReading() {
  const [loading, setLoading] = useState(true);
  const { status } = useSession();

  // Use the sync hook for enhanced functionality
  const {
    history,
    refreshHistory,
  } = useReadingHistorySync();

  // Handle removing a single item
  const handleRemoveItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling to parent links
    await removeFromReadingHistoryComplete(id, status === 'authenticated');
    refreshHistory();
  };

  useEffect(() => {
    setLoading(false);
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
    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <div className="space-y-4 pr-2">
        {history.length > 0 ? (
          <>
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
                {/* Delete button - Always visible on mobile, hover on desktop */}
                <button
                  onClick={(e) => handleRemoveItem(item.id, e)}
                  className="absolute top-0 right-0 p-2 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive
                            opacity-100 md:opacity-0 md:group-hover:opacity-100
                            transition-opacity min-h-[32px] min-w-[32px] flex items-center justify-center
                            touch-manipulation"
                  aria-label="Xóa khỏi lịch sử"
                >
                  <X className="h-4 w-4" />
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
    </div>
  );
}

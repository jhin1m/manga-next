"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
// Removed loading overlay - using instant navigation
import { X } from "lucide-react";
import { removeFromReadingHistoryComplete } from "@/lib/utils/readingHistory";
import { useSession } from "next-auth/react";
import { useReadingHistorySync } from "@/hooks/useReadingHistorySync";
import { useTranslations } from 'next-intl';
import { useFormat } from '@/hooks/useFormat';

export default function HistoryReading() {
  const [loading, setLoading] = useState(true);
  const { status } = useSession();
  const t = useTranslations('readingHistory');
  const { formatDate } = useFormat();

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
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm">Loading reading history...</span>
        </div>
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
                    sizes="48px"
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
                        {item.chapter.title}
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
                  aria-label={t('removeFromHistory')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">{t('noHistoryYet')}</p>
            <Link href="/manga" className="text-xs text-primary hover:underline">
              {t('exploreToRead')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

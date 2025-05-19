'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import { formatDate, formatViews } from '@/lib/utils/format';
import { getReadingHistory } from '@/lib/utils/readingHistory';
import { cn } from '@/lib/utils';

interface Chapter {
  id: string;
  number: number;
  title: string;
  slug: string;
  releaseDate: string;
  views: number;
}

interface MangaChapterListProps {
  mangaSlug: string;
  chapters: Chapter[];
}

export default function MangaChapterList({ mangaSlug, chapters }: MangaChapterListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isClient, setIsClient] = useState(false);
  const [readChapters, setReadChapters] = useState<Record<string, boolean>>({});

  // Set isClient to true after hydration is complete and load reading history
  useEffect(() => {
    setIsClient(true);
    
    // Lấy lịch sử đọc từ localStorage
    const history = getReadingHistory();
    
    // Tạo map các chapter đã đọc của manga hiện tại
    const readMap: Record<string, boolean> = {};
    history.forEach(item => {
      if (item.manga.slug === mangaSlug && item.chapter) {
        readMap[item.chapter.slug] = true;
      }
    });
    
    setReadChapters(readMap);
  }, [mangaSlug]);

  // Filter chapters based on search term
  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.number.toString().includes(searchTerm)
  );

  // Sort chapters based on sort order
  const sortedChapters = [...filteredChapters].sort((a, b) => {
    if (sortOrder === 'newest') {
      return b.number - a.number;
    } else {
      return a.number - b.number;
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <CardTitle className="text-xl">Chapters</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="text-xs"
          >
            <ArrowUpDown className="mr-2 h-3 w-3" />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 pb-5 pr-2">
          {sortedChapters.length > 0 ? (
            sortedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/manga/${mangaSlug}/${chapter.slug}`}
                className={cn(
                  "block",
                  "chapter-link", // Class chung cho tất cả chapter link
                  readChapters[chapter.slug] && "read-chapter" // Class cho chapter đã đọc
                )}
              >
                <div className={cn(
                  "flex flex-col h-full p-3 rounded-md transition-colors border",
                  readChapters[chapter.slug] 
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10" 
                    : "border-border/40 hover:bg-accent"
                )}>
                  <div className="font-medium mb-2 flex items-center gap-1">
                    {readChapters[chapter.slug] && (
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                    )}
                    <span className={readChapters[chapter.slug] ? "text-primary/80" : ""}>
                      {chapter.title}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatViews(chapter.views)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(chapter.releaseDate)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-2 md:col-span-4 text-center py-4 text-muted-foreground">
              No chapters found matching &quot;{searchTerm}&quot;
            </div>
          )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

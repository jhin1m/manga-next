'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Clock, ArrowUpDown } from 'lucide-react';

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

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  // Format view count (e.g., 1200 -> 1.2K)
  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

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

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 pb-5">
          {sortedChapters.length > 0 ? (
            sortedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/manga/${mangaSlug}/${chapter.slug}`}
                className="block"
              >
                <div className="flex flex-col h-full p-3 rounded-md hover:bg-accent transition-colors border border-border/40">
                  <div className="font-medium mb-2">{chapter.title}</div>
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
              No chapters found matching "{searchTerm}"
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

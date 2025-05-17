"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Eye, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatViews, formatDate } from "@/lib/utils";

type RecommendedMangaType = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  rating: number;
  status: string;
  views: number;
  genres: string[];
  latestChapter: {
    number: number;
    title?: string;
    updatedAt: string;
  } | null;
};

// Chuyển hàm fetch vào component chính để tránh gọi nhiều lần

export default function RecommendedManga() {
  const [manga, setManga] = useState<RecommendedMangaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRecommendedManga = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?sort=popular&limit=5`);

        if (!res.ok) {
          throw new Error('Failed to fetch recommended manga data');
        }

        const data = await res.json();
        const recommendedManga = data.comics.map((comic: any) => ({
          id: comic.id.toString(),
          title: comic.title,
          slug: comic.slug,
          coverImage: comic.cover_image_url || 'https://placehold.co/100x150/png',
          rating: comic.rating || Math.floor(Math.random() * 2) + 8, // Fallback random rating between 8-10
          status: comic.status || 'Updating',
          views: comic.views || Math.floor(Math.random() * 10000) + 1000,
          genres: comic.genres?.map((g: any) => g.name) || ['Action', 'Adventure'],
          latestChapter: comic.chapters && comic.chapters.length > 0 
            ? {
                number: comic.chapters[0].number,
                title: comic.chapters[0].title,
                updatedAt: comic.chapters[0].updated_at || new Date().toISOString()
              }
            : null
        }));
        
        setManga(recommendedManga);
        setError(false);
      } catch (error) {
        console.error('Error fetching recommended manga data:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedManga();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
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
  
  if (error || manga.length === 0) {
    return (
      <div className="space-y-4 text-center py-2">
        <p className="text-sm text-muted-foreground">Failed to load recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {manga.map((item: RecommendedMangaType) => (
        <div key={item.id} className="flex gap-3">
          <div className="relative h-16 w-12 rounded-md overflow-hidden shrink-0">
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="font-medium text-sm line-clamp-1">
              <Link href={`/manga/${item.slug}`} className="hover:text-primary">
                {item.title}
              </Link>
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                <span>{item.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{formatViews(item.views)}</span>
              </div>
            </div>
            {item.genres && item.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.genres.slice(0, 2).map((genre, index) => (
                  <Badge key={index} variant="outline" className="px-1 py-0 text-[10px]">
                    {genre}
                  </Badge>
                ))}
                {item.genres.length > 2 && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px]">+{item.genres.length - 2}</Badge>
                )}
              </div>
            )}
            {item.latestChapter && (
              <div className="flex items-center gap-1 text-[10px] mt-1">
                <Clock className="w-2 h-2" />
                <span>Ch.{item.latestChapter.number} • {formatDate(item.latestChapter.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

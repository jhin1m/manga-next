import Image from "next/image";
import Link from "next/link";
import { Star, Eye, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatViews, formatDate } from "@/lib/utils/format";
import { mangaApi } from '@/lib/api/client';

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

// Server-side data fetching
async function fetchRecommendedManga(): Promise<RecommendedMangaType[]> {
  try {
    // Use centralized API client with built-in ISR caching
    const data = await mangaApi.getList({
      sort: 'popular',
      limit: 5,
    });

    // Transform API data to match component needs
    return data.comics.map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      slug: comic.slug,
      coverImage: comic.cover_image_url || 'https://placehold.co/100x150/png',
      rating: comic.rating || Math.floor(Math.random() * 2) + 8, // Fallback random rating between 8-10
      status: comic.status || 'Updating',
      views: comic.total_views || Math.floor(Math.random() * 10000) + 1000,
      genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || ['Action', 'Adventure'],
      latestChapter: comic.Chapters && comic.Chapters.length > 0
        ? {
            number: parseFloat(comic.Chapters[0].chapter_number),
            title: comic.Chapters[0].title,
            updatedAt: comic.Chapters[0].release_date || new Date().toISOString()
          }
        : null
    }));
  } catch (error) {
    console.error('Error fetching recommended manga data:', error);
    return [];
  }
}

// Server Component - fetches data before render
export default async function RecommendedManga() {
  const manga = await fetchRecommendedManga();

  if (manga.length === 0) {
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

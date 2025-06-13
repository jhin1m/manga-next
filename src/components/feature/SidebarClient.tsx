"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, MessageCircle, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatViews, formatDate } from "@/lib/utils/format";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Types for sidebar data
type RankingItem = {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  views: number;
  rank: number;
};

type RecentComment = {
  id: number;
  content: string;
  created_at: string;
  Users: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  Comics?: {
    id: number;
    title: string;
    slug: string;
  };
  Chapters?: {
    id: number;
    title: string;
    chapter_number: number;
    slug: string;
  };
};

type RecommendedManga = {
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
    title: string;
    updatedAt: string;
  } | null;
};

interface SidebarClientProps {
  sidebarData: {
    rankings: RankingItem[];
    recentComments: RecentComment[];
    recommendedManga: RecommendedManga[];
  };
}

export default function SidebarClient({ sidebarData }: SidebarClientProps) {
  const t = useTranslations('sidebar');

  const { rankings, recentComments, recommendedManga } = sidebarData;

  return (
    <div className="space-y-6">
      {/* Rankings Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('rankings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rankings.length > 0 ? (
              rankings.slice(0, 5).map((manga, index) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  {/* Rank number */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Cover image */}
                  <div className="relative h-12 w-9 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={manga.coverImage}
                      alt={manga.title}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>

                  {/* Manga info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {manga.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatViews(manga.views)} views
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noRankingsAvailable')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Comments Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            {t('recentComments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComments.length > 0 ? (
              recentComments.slice(0, 5).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {/* User avatar */}
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage 
                      src={comment.Users.avatar_url} 
                      alt={comment.Users.username} 
                    />
                    <AvatarFallback className="text-xs">
                      {comment.Users.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Comment content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.Users.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {comment.content}
                    </p>

                    {/* Manga/Chapter link */}
                    {comment.Comics && (
                      <Link 
                        href={`/manga/${comment.Comics.slug}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {comment.Comics.title}
                        {comment.Chapters && ` - Chapter ${comment.Chapters.chapter_number}`}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noCommentsYet')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Manga Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-purple-500" />
            {t('recommendedManga')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedManga.length > 0 ? (
              recommendedManga.slice(0, 5).map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.slug}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  {/* Cover image */}
                  <div className="relative h-16 w-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={manga.coverImage}
                      alt={manga.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  {/* Manga info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {manga.title}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{manga.rating.toFixed(1)}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {manga.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatViews(manga.views)} views</span>
                      {manga.latestChapter && (
                        <>
                          <span>•</span>
                          <span>Ch. {manga.latestChapter.number}</span>
                        </>
                      )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1">
                      {manga.genres?.slice(0, 2).map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="text-xs px-1 py-0"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noRecommendationsAvailable')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

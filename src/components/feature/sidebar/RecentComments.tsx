"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useFormat } from "@/hooks/useFormat";
// Removed loading overlay - using instant navigation
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { commentApi } from "@/lib/api/client";

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

export default function RecentComments() {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('comments');
  const { formatDate } = useFormat();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Fetch recent comments from API
        const data = await commentApi.getRecent({ limit: 5 });
        setComments(data.comments || []);
      } catch (error) {
        console.error("Failed to fetch recent comments:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm">Loading recent comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={comment.Users.avatar_url || undefined}
                alt={comment.Users.username}
              />
              <AvatarFallback className="text-sm font-medium">
                {comment.Users.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.Users.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{comment.content}</p>
              {(comment.Comics || comment.Chapters) && (
                <div className="text-xs text-primary">
                  <Link
                    href={
                      comment.Chapters
                        ? `/manga/${comment.Comics?.slug}/${comment.Chapters.slug}`
                        : `/manga/${comment.Comics?.slug}`
                    }
                    className="line-clamp-1"
                  >
                    {comment.Comics?.title}
                    {comment.Chapters ? ` ${t('chapter')}${comment.Chapters.chapter_number}` : ""}
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">{t('noRecentComments')}</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

type Comment = {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  manga: {
    id: string;
    title: string;
    slug: string;
  };
  chapter?: {
    id: string;
    number: number;
    slug: string;
  };
  createdAt: string;
};

export default function RecentComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Simulate API call - replace with actual API endpoint when available
        // const res = await fetch('/api/comments/recent');
        // const data = await res.json();
        
        // Mock data for now
        const mockComments: Comment[] = [
          {
            id: "1",
            content: "This chapter was amazing! Can't wait for the next one.",
            user: {
              id: "user1",
              name: "MangaFan123",
              avatar: "https://placehold.co/100x100/png",
            },
            manga: {
              id: "manga1",
              title: "One Piece",
              slug: "one-piece",
            },
            chapter: {
              id: "chapter1",
              number: 1084,
              slug: "one-piece-chapter-1084",
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          },
          {
            id: "2",
            content: "The art style in this manga is absolutely beautiful!",
            user: {
              id: "user2",
              name: "ArtLover",
              avatar: "https://placehold.co/100x100/png",
            },
            manga: {
              id: "manga2",
              title: "Demon Slayer",
              slug: "demon-slayer",
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          },
          {
            id: "3",
            content: "This plot twist was unexpected. The author is a genius!",
            user: {
              id: "user3",
              name: "PlotTwistFan",
              avatar: "https://placehold.co/100x100/png",
            },
            manga: {
              id: "manga3",
              title: "Attack on Titan",
              slug: "attack-on-titan",
            },
            chapter: {
              id: "chapter3",
              number: 139,
              slug: "attack-on-titan-chapter-139",
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          },
        ];
        
        setComments(mockComments);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch recent comments:", error);
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
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
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src={comment.user.avatar}
                alt={comment.user.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{comment.content}</p>
              <div className="text-xs text-primary">
                <Link
                  href={
                    comment.chapter
                      ? `/manga/${comment.manga.slug}/${comment.chapter.slug}`
                      : `/manga/${comment.manga.slug}`
                  }
                >
                  {comment.manga.title}
                  {comment.chapter ? ` Ch.${comment.chapter.number}` : ""}
                </Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No recent comments.</p>
      )}
    </div>
  );
}

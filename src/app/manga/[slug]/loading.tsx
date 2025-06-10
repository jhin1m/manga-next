import {
  AnimatedMangaDetailSkeleton,
  AnimatedChapterListSkeleton,
  AnimatedRelatedMangaSkeleton
} from "@/components/ui/skeletons/AnimatedMangaSkeleton";
import { CommentSectionSkeleton } from "@/components/ui/skeletons/MangaDetailSkeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Manga Information Section Skeleton */}
      <AnimatedMangaDetailSkeleton />

      {/* Chapters and Related Manga Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapters Section Skeleton */}
        <section className="lg:col-span-3">
          <AnimatedChapterListSkeleton />
        </section>

        {/* Related Manga Section Skeleton */}
        <section className="lg:col-span-1">
          <AnimatedRelatedMangaSkeleton />
        </section>
      </div>

      {/* Comments Section Skeleton */}
      <section className="mt-8">
        <CommentSectionSkeleton />
      </section>
    </div>
  );
}

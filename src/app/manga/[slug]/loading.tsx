import {
  MangaDetailInfoSkeleton,
  MangaChapterListSkeleton,
  RelatedMangaSkeleton,
  CommentSectionSkeleton
} from "@/components/ui/skeletons/MangaDetailSkeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Manga Information Section Skeleton - Simplified */}
      <MangaDetailInfoSkeleton />

      {/* Chapters and Related Manga Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chapters Section Skeleton */}
        <section className="lg:col-span-3">
          <MangaChapterListSkeleton />
        </section>

        {/* Related Manga Section Skeleton */}
        <section className="lg:col-span-1">
          <RelatedMangaSkeleton />
        </section>
      </div>

      {/* Comments Section Skeleton */}
      <section className="mt-8">
        <CommentSectionSkeleton />
      </section>
    </div>
  );
}

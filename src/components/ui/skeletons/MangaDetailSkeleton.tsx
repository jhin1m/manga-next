import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MangaDetailInfoSkeleton() {
  return (
    <section className="relative overflow-hidden">
      {/* Background skeleton */}
      <div className="absolute inset-0 z-0">
        <Skeleton className="w-full h-full" />
      </div>

      <Card className="relative z-10 bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {/* Left Column - Cover + Title + Actions */}
            <div className="col-span-1 lg:col-span-3">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Cover Image Skeleton */}
                <div className="aspect-[2/3] w-40 xs:w-48 sm:w-56 lg:w-64 mx-auto sm:mx-0 flex-shrink-0">
                  <Skeleton className="w-full h-full rounded-xl" />
                </div>

                {/* Title + Action Buttons Skeleton */}
                <div className="flex-1 flex flex-col text-center sm:text-left space-y-3 sm:space-y-4">
                  {/* Status Label Skeleton */}
                  <div className="hidden lg:block">
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {/* Title Section Skeleton */}
                  <div>
                    <Skeleton className="h-8 sm:h-10 lg:h-12 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex flex-col xs:flex-row lg:flex-row gap-2 sm:gap-3">
                    <Skeleton className="h-10 flex-1 lg:flex-none lg:w-32" />
                    <Skeleton className="h-10 flex-1 lg:flex-none lg:w-32" />
                    <Skeleton className="h-10 flex-1 lg:flex-none lg:w-32" />
                  </div>

                  {/* Stats Skeleton - Desktop only */}
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-4 lg:gap-6">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-18" />
                    </div>
                  </div>

                  {/* Description Skeleton - Desktop */}
                  <div className="hidden lg:block">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Metadata Skeleton */}
            <div className="col-span-1 lg:col-span-1 space-y-3 sm:space-y-4 mt-4 sm:mt-12">
              {/* Description Skeleton - Mobile/Tablet only */}
              <div className="lg:hidden">
                <Skeleton className="h-6 w-24 mb-2 mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </div>

              {/* Details Header Skeleton - Mobile/Tablet only */}
              <div className="lg:hidden">
                <Skeleton className="h-8 w-full" />
              </div>

              {/* Genres Skeleton */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center lg:justify-start">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>

              {/* Stats Skeleton - Mobile/Tablet */}
              <div className="lg:hidden flex items-center justify-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-10" />
              </div>

              {/* Metadata Skeleton */}
              <div className="space-y-1.5 sm:space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-center lg:justify-start">
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>

              {/* Star Rating Skeleton */}
              <div className="flex justify-center lg:justify-start py-1">
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function MangaChapterListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RelatedMangaSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-1 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-2 rounded-lg">
            <Skeleton className="h-16 w-12 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CommentSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Comment form skeleton */}
        <div className="mb-6 space-y-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Comments list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-4 mt-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MangaDetailPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Manga Information Section Skeleton */}
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

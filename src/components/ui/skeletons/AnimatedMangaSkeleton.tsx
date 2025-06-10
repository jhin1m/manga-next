import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnimatedMangaDetailSkeleton() {
  return (
    <section className="relative overflow-hidden">
      <Card className="relative z-10 bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {/* Left Column - Cover + Title + Actions */}
            <div className="col-span-1 lg:col-span-3">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Cover Image Skeleton */}
                <div className="aspect-[2/3] w-40 xs:w-48 sm:w-56 lg:w-64 mx-auto sm:mx-0 flex-shrink-0">
                  <Skeleton className="w-full h-full rounded-xl animate-pulse" />
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

            {/* Right Column - Metadata Skeleton - Desktop only */}
            <div className="hidden lg:block col-span-1 lg:col-span-1 space-y-3 sm:space-y-4 mt-4 sm:mt-12">
              {/* Genres Skeleton */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-start">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>

              {/* Metadata Skeleton */}
              <div className="space-y-1.5 sm:space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-start">
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>

              {/* Star Rating Skeleton */}
              <div className="flex justify-start py-1">
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function AnimatedChapterListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </CardHeader>
      <CardContent>
        {/* Search input skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>

        {/* Chapters grid skeleton */}
        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-3 pb-5 pr-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col h-full p-3 rounded-md border">
                {/* Chapter title */}
                <div className="font-medium mb-2">
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Chapter stats */}
                <div className="mt-auto flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnimatedRelatedMangaSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-1 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-2 rounded-lg animate-pulse">
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

// Animated Chapter Reader Skeleton Components
export function AnimatedChapterReaderNavigationSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm shadow-md p-2 border-b w-full">
      <div className="flex items-center gap-1 justify-center md:container md:mx-auto overflow-x-auto">
        {/* Navigation buttons with staggered animation */}
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            className={`h-9 rounded-md flex-shrink-0 animate-pulse ${
              index === 3 ? 'flex-1 max-w-[150px] md:max-w-[250px]' : 'w-9'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </header>
  );
}

export function AnimatedChapterImagesSkeleton() {
  const DEFAULT_PLACEHOLDER_HEIGHT = 800;

  return (
    <main className="pt-2 pb-16">
      <div className="flex flex-col items-center w-full sm:max-w-5xl sm:mx-auto">
        {/* Generate multiple image skeletons with staggered animation */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="w-full mb-1"
            style={{
              animationDelay: `${index * 150}ms`
            }}
          >
            <Skeleton
              className="w-full rounded-none animate-pulse"
              style={{
                height: `${DEFAULT_PLACEHOLDER_HEIGHT}px`,
                animationDuration: '2s',
                animationDelay: `${index * 150}ms`
              }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export function AnimatedChapterReaderSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation skeleton */}
      <AnimatedChapterReaderNavigationSkeleton />

      {/* Chapter images skeleton */}
      <AnimatedChapterImagesSkeleton />
    </div>
  );
}

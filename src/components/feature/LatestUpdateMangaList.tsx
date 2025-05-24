import MangaCard from '@/components/feature/MangaCard';
import { formatDate } from '@/lib/utils/format';
import { safePrisma } from '@/lib/db-safe';

// Define manga type for this component
type Manga = {
  id: string;
  title: string;
  coverImage: string;
  slug: string;
  latestChapter: string | undefined;
  genres: string[];
  rating: number;
  views: number;
  chapterCount: number;
  updatedAt: string;
  status: string;
};

async function fetchLatestManga(page: number = 1, limit: number = 12) {
  try {
    // Use safe database access instead of API call
    const comics = await safePrisma.comics.findMany({
      include: {
        Comic_Genres: {
          include: {
            Genres: true
          }
        },
        Chapters: {
          orderBy: { chapter_number: 'desc' },
          take: 1,
          select: {
            id: true,
            chapter_number: true,
            title: true,
            slug: true,
            release_date: true
          }
        },
        _count: {
          select: {
            Chapters: true
          }
        }
      },
      orderBy: { last_chapter_uploaded_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform database results to component format
    return {
      manga: comics.map((comic: any) => ({
        id: comic.id.toString(),
        title: comic.title,
        coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
        slug: comic.slug,
        latestChapter: comic.Chapters && comic.Chapters.length > 0
          ? `Chapter ${comic.Chapters[0].chapter_number}`
          : undefined,
        latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].slug
          : undefined,
        genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
        rating: comic.rating || Math.floor(Math.random() * 2) + 8, // Fallback random rating between 8-10
        views: comic.total_views || 0,
        chapterCount: comic._count?.Chapters || 0,
        updatedAt: comic.last_chapter_uploaded_at
          ? formatDate(comic.last_chapter_uploaded_at)
          : 'Recently',
        status: comic.status || 'Ongoing',
      })),
      totalPages: Math.ceil(comics.length / limit) || 1,
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching latest manga data:', error);
    return { manga: [], totalPages: 1, currentPage: 1 };
  }
}

export default async function LatestUpdateMangaList({
  page = 1,
  limit = 12
}: {
  page?: number;
  limit?: number;
}) {
  const { manga, totalPages } = await fetchLatestManga(page, limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Latest Updates</h2>
      </div>

      {manga.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {manga.map((item: Manga) => (
            <MangaCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        // Loading state
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="animate-pulse bg-muted aspect-[2/3] w-full h-auto rounded-md" />
              <div className="animate-pulse bg-muted h-4 w-full rounded-md" />
              <div className="animate-pulse bg-muted h-3 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Pagination will be handled by a separate component */}
      <div className="flex justify-center mt-8">
        {/* Pass totalPages for the Pagination component to use */}
        <div className="hidden" data-total-pages={totalPages} data-current-page={page} />
      </div>
    </div>
  );
}

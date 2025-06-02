import { Metadata } from 'next';
import FilterSortBar from '@/components/feature/FilterSortBar';
import MangaCard from '@/components/feature/MangaCard';
import PaginationWrapper from '@/components/feature/PaginationWrapper';
import { constructMetadata } from '@/lib/seo/metadata';
import JsonLdScript from '@/components/seo/JsonLdScript';
import { generateMangaListJsonLd } from '@/lib/seo/jsonld';
import { mangaApi } from '@/lib/api/client';
import { seoConfig, getSiteUrl } from '@/config/seo.config';

// Fetch manga from API using centralized API client
async function fetchManga(params: {
  sort?: string;
  status?: string;
  genre?: string;
  page?: number;
  limit?: number;
}) {
  try {
    // Use centralized API client with built-in ISR caching
    const data = await mangaApi.getList({
      sort: params.sort,
      status: params.status !== 'all' ? params.status : undefined,
      genre: params.genre !== 'all' ? params.genre : undefined,
      page: params.page,
      limit: params.limit,
    });

    // Transform API data to match our component needs (preserve existing logic)
    return {
      data: data.comics.map((comic: any) => ({
        id: comic.id.toString(),
        title: comic.title,
        coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
        slug: comic.slug,
        latestChapter: comic.Chapters && comic.Chapters.length > 0
          ? `${comic.Chapters[0].title}`
          : undefined,
        latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].slug
          : undefined,
        genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
        rating: comic.rating,
        views: comic.total_views || 0,
        chapterCount: comic._chapterCount || 0,
        updatedAt: comic.last_chapter_uploaded_at || undefined,
        status: comic.status || 'Ongoing',
      })),
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      totalResults: data.totalComics
    };
  } catch (error) {
    console.error('Error fetching manga list:', error);
    return { data: [], totalPages: 0, currentPage: 1, totalResults: 0 };
  }
}

export const metadata: Metadata = constructMetadata({
  title: `Latest Manga - ${seoConfig.site.name}`,
  description: `Browse the latest manga updates on ${seoConfig.site.name}. Find your favorite manga series and read them online for free.`,
  keywords: ['manga list', 'latest manga', 'read manga online', 'free manga', 'manga updates', seoConfig.site.name.toLowerCase()],
  canonical: getSiteUrl('/manga'),
});

export default async function MangaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Extract search parameters safely - await them in Next.js 15
  const params = await searchParams;

  const sortParam = params['sort'];
  const sort = typeof sortParam === 'string' ? sortParam : 'latest';

  const statusParam = params['status'];
  const status = typeof statusParam === 'string' ? statusParam : undefined;

  const genreParam = params['genre'];
  const genre = typeof genreParam === 'string' ? genreParam : undefined;

  const pageParam = params['page'];
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 20) : 1;

  const limit = 20; // Number of manga per page

  // Fetch manga with filters
  const results = await fetchManga({ sort, status, genre, page, limit });
  const manga = results.data;
  const totalPages = results.totalPages;
  const currentPage = results.currentPage;

  // Determine page title based on filters
  let pageTitle = 'Latest Manga';
  if (sort === 'popular') pageTitle = 'Popular Manga';
  if (status === 'completed') pageTitle = 'Completed Manga';
  if (genre) pageTitle = `${genre.charAt(0).toUpperCase() + genre.slice(1)} Manga`;

  // Define manga item type
  interface MangaItem {
    id: string;
    title: string;
    coverImage: string;
    slug: string;
    latestChapter?: string;
    genres?: string[];
    rating?: number;
    views?: number;
    chapterCount?: number;
    updatedAt?: string;
    status?: string;
  }

  // Helper function to build query string
  function buildQueryString(sort: string, status?: string, genre?: string): string {
    const params = new URLSearchParams();

    if (sort && sort !== 'latest') {
      params.append('sort', sort);
    }

    if (status) {
      params.append('status', status);
    }

    if (genre) {
      params.append('genre', genre);
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Tạo JSON-LD cho trang danh sách manga
  const jsonLd = generateMangaListJsonLd();

  return (
    <div className="container mx-auto py-8">
      <JsonLdScript id="manga-list-jsonld" jsonLd={jsonLd} />
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>

      <div className="mb-6">
        <FilterSortBar />
      </div>

      {manga.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {manga.map((item: MangaItem) => (
              <MangaCard
                key={item.id}
                {...item as any}
                showFavoriteButton={true}
              />
            ))}
          </div>

          {/* Pagination */}
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/manga${buildQueryString(sort, status, genre)}`}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No manga found with the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}

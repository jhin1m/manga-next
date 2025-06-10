import { Metadata } from 'next';
import { constructMangaListMetadata } from '@/lib/seo/metadata';
import JsonLdScript from '@/components/seo/JsonLdScript';
import { generateMangaListJsonLd } from '@/lib/seo/jsonld';
import { mangaApi } from '@/lib/api/client';
import MangaPageTracker from '@/components/analytics/MangaPageTracker';
import { getServerPageTitle } from '@/lib/page-titles';
import { getLocale } from 'next-intl/server';
import MangaListClient from '@/components/manga/MangaListClient';
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
        status: comic.status,
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

// Generate dynamic metadata based on search parameters
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;

  const sortParam = params['sort'];
  const sort = typeof sortParam === 'string' ? sortParam : 'latest';

  const statusParam = params['status'];
  const status = typeof statusParam === 'string' ? statusParam : undefined;

  const genreParam = params['genre'];
  const genre = typeof genreParam === 'string' ? genreParam : undefined;

  const pageParam = params['page'];
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  // Get current locale from next-intl
  const currentLocale = await getLocale();

  // Get page title using configurable system
  const pageTitle = getServerPageTitle('manga', { sort, status, genre }, currentLocale);

  // Build filters array for SEO
  const filters: string[] = [];
  if (sort !== 'latest') filters.push(sort);
  if (status) filters.push(status);
  if (genre) filters.push(genre);

  // Get total results (we'll estimate for now, could be fetched from API)
  const estimatedResults = 1000; // This could be fetched from API

  return constructMangaListMetadata({
    pageTitle,
    totalResults: estimatedResults,
    filters,
    sort,
    status,
    genre,
    page,
  });
}

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
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  const limit = 24; // Number of manga per page

  // Fetch manga with filters
  const results = await fetchManga({ sort, status, genre, page, limit });
  const manga = results.data;
  const totalPages = results.totalPages;
  const currentPage = results.currentPage;

  // Get current locale from next-intl
  const currentLocale = await getLocale();

  // Get page title using configurable system
  const pageTitle = getServerPageTitle('manga', { sort, status, genre }, currentLocale);



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
    <div>
      <JsonLdScript id="manga-list-jsonld" jsonLd={jsonLd} />
      <MangaPageTracker
        pageTitle={pageTitle}
        sort={sort}
        status={status}
        genre={genre}
        page={currentPage}
        totalResults={results.totalResults}
      />
      <MangaListClient
        manga={manga}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={results.totalResults}
        sort={sort}
        status={status}
        genre={genre}
        pageTitle={pageTitle}
        baseUrl={`/manga${buildQueryString(sort, status, genre)}`}
      />
    </div>
  );
}

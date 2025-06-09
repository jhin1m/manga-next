import { Metadata } from 'next';
import Image from 'next/image';
import PaginationWrapper from '@/components/feature/PaginationWrapper';
// Removed formatDate import since it's not used for display in search results
import { prisma } from '@/lib/db';
import { constructSearchMetadata } from '@/lib/seo/metadata';
import { generateSearchJsonLd } from '@/lib/seo/jsonld';
import JsonLdScript from '@/components/seo/JsonLdScript';
import { getSiteUrl } from '@/config/seo.config';
import { getTranslations } from 'next-intl/server';

// Fetch all genres for filter options
async function fetchGenres() {
  try {
    const genres = await prisma.genres.findMany({
      orderBy: { name: 'asc' }
    });
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

// Fetch search results from API
async function fetchSearchResults(
  query: string,
  page: number = 1,
  limit: number = 20,
  genre?: string | null,
  status?: string | null,
  sort?: string | null
) {
  try {
    if (!query) return {
      data: [],
      totalPages: 0,
      currentPage: 1,
      totalResults: 0,
      searchTerms: []
    };

    // Build the URL with all parameters using centralized config
    let url = `${getSiteUrl()}/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;

    // Add optional parameters if they exist
    if (genre) url += `&genre=${encodeURIComponent(genre)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (sort) url += `&sort=${encodeURIComponent(sort)}`;

    // Add cache: 'no-store' to ensure we get fresh data
    const res = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      console.error(`Failed to fetch search results: ${res.status} ${res.statusText}`);

      // Check for specific error responses
      if (res.status === 400) {
        const errorData = await res.json();
        console.error('Search API error details:', errorData);
      }

      throw new Error(`Search API returned status: ${res.status}`);
    }

    const data = await res.json();

    // Validate the response data structure
    if (!data || !Array.isArray(data.comics)) {
      console.error('Invalid search results format:', data);
      throw new Error('Invalid search results format');
    }

    // Transform API data to match our component needs
    return {
      data: data.comics.map((comic: any) => ({
        id: comic.id.toString(),
        title: comic.title,
        coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
        slug: comic.slug,
        latestChapter: comic.Chapters && comic.Chapters.length > 0
          ? `Chapter ${comic.Chapters[0].chapter_number}`
          : 'Updating',
        latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].slug
          : '',
        genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
        rating: 8.5, // Placeholder as it's not in the API
        views: comic.total_views || 0,
        chapterCount: comic._chapterCount || 0,
        updatedAt: comic.last_chapter_uploaded_at || undefined,
        status: comic.status || 'Ongoing',
        highlightedTitle: comic._highlightedTitle || comic.title,
        highlightedDescription: comic._highlightedDescription || comic.description,
        rank: comic.rank
      })),
      totalPages: data.totalPages || 0,
      currentPage: data.currentPage || 1,
      totalResults: data.totalComics || 0,
      searchTerms: data.searchTerms || []
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    // Re-throw the error to be handled by the error boundary
    throw error;
  }
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  // In NextJS 15, we need to await searchParams
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';

  return constructSearchMetadata({
    query,
    resultsCount: undefined, // We don't have this info at metadata generation time
  });
}



// Enhanced MangaCard component that can display highlighted content
async function EnhancedMangaCard({
  item,
  showHighlights = false
}: {
  item: any,
  showHighlights?: boolean
}) {
  const tManga = await getTranslations('manga');

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <a href={`/manga/${item.slug}`} className="block">
        <div className="relative aspect-[2/3] bg-muted">
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            loading="lazy"
          />
          {item.status && (
            <span className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">
              {item.status}
            </span>
          )}
        </div>

        <div className="p-3">
          {showHighlights && item.highlightedTitle ? (
            <h3
              className="font-semibold text-sm line-clamp-2 mb-1"
              dangerouslySetInnerHTML={{ __html: item.highlightedTitle }}
            />
          ) : (
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.title}</h3>
          )}

          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.genres.slice(0, 2).map((genre: string) => (
                <span key={genre} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {genre}
                </span>
              ))}
              {item.genres.length > 2 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  +{item.genres.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{item.chapterCount} {tManga('chapters')}</span>
            <span>{item.views} {tManga('views')}</span>
          </div>

          {showHighlights && item.highlightedDescription && (
            <div
              className="mt-2 text-xs text-muted-foreground line-clamp-3 border-t pt-2"
              dangerouslySetInnerHTML={{ __html: item.highlightedDescription }}
            />
          )}
        </div>
      </a>
    </div>
  );
}

// Search filters component
async function SearchFilters({
  genres,
  currentGenre,
  currentStatus,
  currentSort,
  query
}: {
  genres: any[],
  currentGenre: string | null,
  currentStatus: string | null,
  currentSort: string | null,
  query: string
}) {
  const tFilter = await getTranslations('filterSort');

  // Status options with translations
  const statusOptions = [
    { value: 'ongoing', label: tFilter('statusOptions.ongoing') },
    { value: 'completed', label: tFilter('statusOptions.completed') },
    { value: 'hiatus', label: tFilter('statusOptions.hiatus') }
  ];

  // Sort options with translations
  const sortOptions = [
    { value: 'relevance', label: tFilter('sortOptions.relevance') },
    { value: 'latest', label: tFilter('sortOptions.latest') },
    { value: 'views', label: tFilter('sortOptions.views') },
    { value: 'title', label: tFilter('sortOptions.title') }
  ];

  return (
    <div className="bg-card rounded-lg p-4 mb-6 shadow-sm">
      <h2 className="font-semibold mb-3">{tFilter('filterResults')}</h2>

      <form action="/search" method="get" className="space-y-4">
        {/* Hidden query field */}
        <input type="hidden" name="q" value={query} />

        {/* Genre filter */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium mb-1">{tFilter('genre')}</label>
          <select
            id="genre"
            name="genre"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue={currentGenre || ''}
          >
            <option value="">{tFilter('allGenres')}</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.slug}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">{tFilter('status')}</label>
          <select
            id="status"
            name="status"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue={currentStatus || ''}
          >
            <option value="">{tFilter('allStatus')}</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort order */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium mb-1">{tFilter('sort')}</label>
          <select
            id="sort"
            name="sort"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue={currentSort || 'relevance'}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Apply filters button */}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {tFilter('applyFilters')}
        </button>
      </form>
    </div>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  // In NextJS 15, we need to await searchParams
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const currentPage = typeof params.page === 'string'
    ? parseInt(params.page, 10)
    : 1;
  const genre = typeof params.genre === 'string' ? params.genre : null;
  const status = typeof params.status === 'string' ? params.status : null;
  const sort = typeof params.sort === 'string' ? params.sort : null;

  // Get translations
  const tSearch = await getTranslations('search');
  const tCommon = await getTranslations('common');

  // Fetch genres for filters
  const genres = await fetchGenres();

  // Generate JSON-LD for search page
  const jsonLd = generateSearchJsonLd(query);

  try {
    const results = await fetchSearchResults(query, currentPage, 20, genre, status, sort);
    const manga = results.data;
    const totalPages = results.totalPages;
    const searchTerms = results.searchTerms || [];

    // Build the base URL for pagination with all filters
    let baseUrl = `/search?q=${encodeURIComponent(query)}`;
    if (genre) baseUrl += `&genre=${encodeURIComponent(genre)}`;
    if (status) baseUrl += `&status=${encodeURIComponent(status)}`;
    if (sort) baseUrl += `&sort=${encodeURIComponent(sort)}`;

    return (
      <div className="container mx-auto px-4 py-8">
        <JsonLdScript id="search-jsonld" jsonLd={jsonLd} />
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <form action="/search" method="get" className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={tSearch('placeholderSimple')}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="sr-only">{tCommon('search')}</span>
              </button>
            </form>
          </div>
        </div>

        {query && (
          <h1 className="text-2xl font-bold mb-6">
            {tSearch('searchResultsFor')} <span className="text-primary">{query}</span>
            {results.totalResults > 0 && (
              <span className="text-muted-foreground text-sm font-normal ml-2">
                ({results.totalResults} {tSearch('results')})
              </span>
            )}
          </h1>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <SearchFilters
              genres={genres}
              currentGenre={genre}
              currentStatus={status}
              currentSort={sort}
              query={query}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            {manga.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {manga.map((item: any) => (
                    <EnhancedMangaCard
                      key={item.id}
                      item={item}
                      showHighlights={searchTerms.length > 0}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl={baseUrl}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg shadow-sm">
                {query ? (
                  <div>
                    <p className="text-muted-foreground mb-2">
                      {tSearch('noResultsFound')} &quot;{query}&quot;.
                    </p>
                    <p className="text-sm">
                      {tSearch('tryDifferentSearch')}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {tSearch('enterSearchTerm')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Render error component
    return (
      <div className="container mx-auto px-4 py-8">
        <JsonLdScript id="search-error-jsonld" jsonLd={jsonLd} />
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <form action="/search" method="get" className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={tSearch('placeholderSimple')}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="sr-only">{tCommon('search')}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">{tSearch('errorLoadingResults')}</h2>
          <p className="text-red-600 mb-2">{error instanceof Error ? error.message : tCommon('error')}</p>
          <p className="text-sm text-muted-foreground">
            {tSearch('checkConnection')}
          </p>
        </div>
      </div>
    );
  }
}

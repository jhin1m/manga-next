import { Metadata } from 'next';
import MangaCard from '@/components/feature/MangaCard';
import SearchBar from '@/components/feature/SearchBar';
import PaginationWrapper from '@/components/feature/PaginationWrapper';

// Helper function to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Fetch search results from API
async function fetchSearchResults(query: string, page: number = 1, limit: number = 20) {
  try {
    if (!query) return { data: [], totalPages: 0, currentPage: 1, totalResults: 0 };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );

    if (!res.ok) {
      console.error('Failed to fetch search results');
      return { data: [], totalPages: 0, currentPage: 1, totalResults: 0 };
    }

    const data = await res.json();

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
        updatedAt: comic.last_chapter_uploaded_at ?
          formatDate(comic.last_chapter_uploaded_at) : 'Recently',
        status: comic.status || 'Ongoing',
      })),
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      totalResults: data.totalComics
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    return { data: [], totalPages: 0, currentPage: 1, totalResults: 0 };
  }
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  return {
    title: query ? `Search results for "${query}" - Dokinaw` : 'Search - Dokinaw',
    description: query
      ? `Find manga with keyword "${query}" on Dokinaw.`
      : 'Search for manga on Dokinaw.',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const currentPage = typeof searchParams.page === 'string'
    ? parseInt(searchParams.page, 10)
    : 1;

  const results = await fetchSearchResults(query, currentPage);
  const manga = results.data;
  const totalPages = results.totalPages;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar className="max-w-2xl mx-auto" />
      </div>

      {query && (
        <h1 className="text-2xl font-bold mb-6">
          Search results for: <span className="text-primary">{query}</span>
          {results.totalResults > 0 && (
            <span className="text-muted-foreground text-sm font-normal ml-2">
              ({results.totalResults} results)
            </span>
          )}
        </h1>
      )}

      {manga.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {manga.map((item) => (
              <MangaCard key={item.id} {...item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationWrapper
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/search?q=${encodeURIComponent(query)}`}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          {query ? (
            <p className="text-muted-foreground">
              No results found for &quot;{query}&quot;. Try a different search term.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Enter a search term to find manga.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

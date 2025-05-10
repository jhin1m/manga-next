import { Metadata, ResolvingMetadata } from 'next';
import MangaCard from '@/components/feature/MangaCard';
import SearchBar from '@/components/feature/SearchBar';

// Mock data for demonstration
const mockManga = [
  {
    id: '1',
    title: 'One Piece',
    coverImage: 'https://placehold.co/300x450',
    slug: 'one-piece',
    latestChapter: 'Chapter 1089',
    genres: ['Action', 'Adventure', 'Fantasy'],
    rating: 4.8,
    views: 1500000,
    chapterCount: 1089,
    updatedAt: '2 days ago',
    status: 'Ongoing',
  },
  {
    id: '2',
    title: 'Naruto',
    coverImage: 'https://placehold.co/300x450',
    slug: 'naruto',
    latestChapter: 'Chapter 700',
    genres: ['Action', 'Adventure', 'Fantasy'],
    rating: 4.7,
    views: 1200000,
    chapterCount: 700,
    updatedAt: '5 years ago',
    status: 'Completed',
  },
  {
    id: '3',
    title: 'Bleach',
    coverImage: 'https://placehold.co/300x450',
    slug: 'bleach',
    latestChapter: 'Chapter 686',
    genres: ['Action', 'Adventure', 'Supernatural'],
    rating: 4.6,
    views: 900000,
    chapterCount: 686,
    updatedAt: '4 years ago',
    status: 'Completed',
  },
  {
    id: '4',
    title: 'Dragon Ball',
    coverImage: 'https://placehold.co/300x450',
    slug: 'dragon-ball',
    latestChapter: 'Chapter 519',
    genres: ['Action', 'Adventure', 'Fantasy'],
    rating: 4.9,
    views: 2000000,
    chapterCount: 519,
    updatedAt: '10 years ago',
    status: 'Completed',
  },
];

// This would be replaced with an actual API call in a real application
async function fetchSearchResults(query: string, page: number = 1) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!query) return { data: [], totalPages: 0 };
  
  // Filter mock data based on query
  const filteredData = mockManga.filter(manga => 
    manga.title.toLowerCase().includes(query.toLowerCase()) ||
    manga.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
  );
  
  return { 
    data: filteredData,
    totalPages: 1
  };
}

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar className="max-w-2xl mx-auto" />
      </div>
      
      {query && (
        <h1 className="text-2xl font-bold mb-6">
          Search results for: <span className="text-primary">{query}</span>
        </h1>
      )}
      
      {manga.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {manga.map((item) => (
            <MangaCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {query ? (
            <p className="text-muted-foreground">
              No results found for "{query}". Try a different search term.
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

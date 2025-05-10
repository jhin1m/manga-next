import { Metadata } from 'next';
import FilterSortBar from '@/components/feature/FilterSortBar';
import MangaCard from '@/components/feature/MangaCard';

// Mock data for demonstration
const mockManga = [
  {
    id: '1',
    title: 'One Piece',
    coverImage: 'https://placehold.co/300x450/png',
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
    coverImage: 'https://placehold.co/300x450/png',
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
    coverImage: 'https://placehold.co/300x450/png',
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
    coverImage: 'https://placehold.co/300x450/png',
    slug: 'dragon-ball',
    latestChapter: 'Chapter 519',
    genres: ['Action', 'Adventure', 'Fantasy'],
    rating: 4.9,
    views: 2000000,
    chapterCount: 519,
    updatedAt: '10 years ago',
    status: 'Completed',
  },
  {
    id: '5',
    title: 'Attack on Titan',
    coverImage: 'https://placehold.co/300x450/png',
    slug: 'attack-on-titan',
    latestChapter: 'Chapter 139',
    genres: ['Action', 'Drama', 'Fantasy', 'Horror'],
    rating: 4.8,
    views: 1800000,
    chapterCount: 139,
    updatedAt: '2 years ago',
    status: 'Completed',
  },
  {
    id: '6',
    title: 'My Hero Academia',
    coverImage: 'https://placehold.co/300x450/png',
    slug: 'my-hero-academia',
    latestChapter: 'Chapter 402',
    genres: ['Action', 'Adventure', 'Superhero'],
    rating: 4.7,
    views: 1300000,
    chapterCount: 402,
    updatedAt: '1 week ago',
    status: 'Ongoing',
  },
  {
    id: '7',
    title: 'Demon Slayer',
    coverImage: 'https://placehold.co/300x450/png',
    slug: 'demon-slayer',
    latestChapter: 'Chapter 205',
    genres: ['Action', 'Supernatural', 'Historical'],
    rating: 4.9,
    views: 1700000,
    chapterCount: 205,
    updatedAt: '1 year ago',
    status: 'Completed',
  },
  {
    id: '8',
    title: 'Jujutsu Kaisen',
    coverImage: 'https://placehold.co/300x450/png',
    slug: 'jujutsu-kaisen',
    latestChapter: 'Chapter 253',
    genres: ['Action', 'Supernatural', 'Horror'],
    rating: 4.8,
    views: 1400000,
    chapterCount: 253,
    updatedAt: '3 days ago',
    status: 'Ongoing',
  },
];

// This would be replaced with an actual API call in a real application
async function fetchManga(params: {
  sort?: string;
  status?: string;
  genres?: string;
  page?: number;
}) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredManga = [...mockManga];

  // Filter by status
  if (params.status && params.status !== 'all') {
    filteredManga = filteredManga.filter(manga =>
      manga.status?.toLowerCase() === params.status?.toLowerCase()
    );
  }

  // Filter by genres
  if (params.genres) {
    const genreList = params.genres.split(',');
    filteredManga = filteredManga.filter(manga =>
      genreList.some(genre => manga.genres.includes(genre))
    );
  }

  // Sort manga
  if (params.sort) {
    switch (params.sort) {
      case 'latest':
        // Sort by update date (most recent first)
        filteredManga.sort((a, b) => a.updatedAt?.includes('day') ? -1 : 1);
        break;
      case 'newest':
        // For demo, just randomize
        filteredManga.sort(() => Math.random() - 0.5);
        break;
      case 'popular':
        // Sort by views
        filteredManga.sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        // Sort by rating
        filteredManga.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  return {
    data: filteredManga,
    totalPages: 1
  };
}

export const metadata: Metadata = {
  title: 'Latest Manga - Dokinaw',
  description: 'Browse the latest manga updates on Dokinaw.',
};

export default async function MangaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams before accessing its properties
  const params = await searchParams;

  // Extract search parameters
  const sort = typeof params.sort === 'string' ? params.sort : 'latest';
  const status = typeof params.status === 'string' ? params.status : undefined;
  const genres = typeof params.genres === 'string' ? params.genres : undefined;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;

  // Fetch manga with filters
  const results = await fetchManga({ sort, status, genres, page });
  const manga = results.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Latest Manga</h1>

      <div className="mb-6">
        <FilterSortBar />
      </div>

      {manga.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {manga.map((item) => (
            <MangaCard key={item.id} {...item} />
          ))}
        </div>
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

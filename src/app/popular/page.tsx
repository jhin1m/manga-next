import { Metadata } from "next";
import MangaCard from "@/components/feature/MangaCard";
import FilterSortBar from "@/components/feature/FilterSortBar";
import PaginationWrapper from "@/components/feature/PaginationWrapper";

export const metadata: Metadata = {
  title: "Popular Manga | Manga Reader",
  description: "Browse the most popular manga series with the highest view counts.",
};

// Fetch manga from API
async function fetchManga({ page = 1, limit = 20 }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?sort=popular&page=${page}&limit=${limit}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch manga');
    }

    const data = await res.json();

    // Transform API data to match our component needs
    const manga = data.comics.map((comic: any) => {
      // Extract genres from Comic_Genres
      const genres = comic.Comic_Genres.map((cg: any) => cg.Genres.name);

      // Get latest chapter if available
      const latestChapter = comic.Chapters && comic.Chapters.length > 0
        ? comic.Chapters[0]
        : null;

      return {
        id: comic.id,
        title: comic.title,
        slug: comic.slug,
        coverImage: comic.cover_image_url,
        status: comic.status,
        genres: genres,
        views: comic.total_views || 0,
        rating: 0, // Not implemented in the API yet
        chapterCount: comic._chapterCount || 0,
        latestChapter: latestChapter ?
          `Chapter ${latestChapter.chapter_number}${latestChapter.title ? ': ' + latestChapter.title : ''}`
        : null,
        updatedAt: comic.last_chapter_uploaded_at
      };
    });

    return {
      data: manga,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      totalManga: data.totalComics
    };
  } catch (error) {
    console.error('Error fetching manga:', error);
    return {
      data: [],
      totalPages: 0,
      currentPage: 1,
      totalManga: 0
    };
  }
}

export default async function PopularPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract search parameters safely
  const pageParam = searchParams['page'];
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  const limit = 20; // Number of manga per page

  // Fetch manga with filters
  const results = await fetchManga({ page, limit });
  const manga = results.data;
  const totalPages = results.totalPages;
  const currentPage = results.currentPage;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Popular Manga</h1>

      <div className="mb-6">
        <FilterSortBar />
      </div>

      {manga.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {manga.map((item) => (
              <MangaCard key={item.id} {...item} />
            ))}
          </div>

          {/* Pagination */}
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/popular"
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No manga found.
          </p>
        </div>
      )}
    </div>
  );
}

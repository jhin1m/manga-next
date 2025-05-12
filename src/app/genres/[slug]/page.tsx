import { Metadata } from "next";
import { notFound } from "next/navigation";
import MangaCard from "@/components/feature/MangaCard";
import FilterSortBar from "@/components/feature/FilterSortBar";
import PaginationWrapper from "@/components/feature/PaginationWrapper";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;

  try {
    // Fetch genre info
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/genres`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch genre data');
    }

    const data = await res.json();
    const genre = data.genres.find((g: any) => g.slug === slug);

    if (!genre) {
      return {
        title: 'Genre Not Found',
        description: 'The requested genre could not be found.'
      };
    }

    return {
      title: `${genre.name} Manga | Manga Reader`,
      description: genre.description || `Browse ${genre.name} manga - Find the best ${genre.name} manga series.`
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Manga by Genre | Manga Reader',
      description: 'Browse manga by genre.'
    };
  }
}

// Fetch manga by genre
async function fetchMangaByGenre({
  genre,
  page = 1,
  limit = 20,
  sort = 'latest'
}: {
  genre: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?genre=${genre}&page=${page}&limit=${limit}&sort=${sort}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch manga by genre');
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
    console.error('Error fetching manga by genre:', error);
    return {
      data: [],
      totalPages: 0,
      currentPage: 1,
      totalManga: 0
    };
  }
}

// Fetch genre info
async function fetchGenreInfo(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/genres`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch genre data');
    }

    const data = await res.json();
    return data.genres.find((g: any) => g.slug === slug);
  } catch (error) {
    console.error('Error fetching genre info:', error);
    return null;
  }
}

export default async function GenrePage({ params, searchParams }: Props) {
  const { slug } = params;

  // Extract search parameters safely
  const sortParam = searchParams['sort'];
  const sort = typeof sortParam === 'string' ? sortParam : 'latest';

  const pageParam = searchParams['page'];
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  const limit = 20; // Number of manga per page

  // Fetch genre info
  const genre = await fetchGenreInfo(slug);

  if (!genre) {
    notFound();
  }

  // Fetch manga with filters
  const results = await fetchMangaByGenre({ genre: slug, sort, page, limit });
  const manga = results.data;
  const totalPages = results.totalPages;
  const currentPage = results.currentPage;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">{genre.name} Manga</h1>
      {genre.description && (
        <p className="text-muted-foreground mb-6">{genre.description}</p>
      )}

      <div className="mb-6">
        <FilterSortBar />
      </div>

      {manga.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {manga.map((item: any) => (
              <MangaCard key={item.id} {...item} />
            ))}
          </div>

          {/* Pagination */}
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/genres/${slug}${sort && sort !== 'latest' ? `?sort=${sort}` : ''}`}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No manga found in this genre.
          </p>
        </div>
      )}
    </div>
  );
}

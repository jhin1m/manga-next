import { Metadata } from "next";
import { notFound } from "next/navigation";
import MangaCard from "@/components/feature/MangaCard";
import FilterSortBar from "@/components/feature/FilterSortBar";
import PaginationWrapper from "@/components/feature/PaginationWrapper";
import { constructMetadata, constructGenreMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateGenreJsonLd } from "@/lib/seo/jsonld";
import { genreApi } from '@/lib/api/client';

import { seoConfig } from '@/config/seo.config';

// Generate metadata for the page
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Use centralized API client for metadata generation
    const data = await genreApi.getList();
    const genre = data.genres.find((g: any) => g.slug === slug);

    if (!genre) {
      return constructMetadata({
        title: 'Genre Not Found',
        description: 'The requested genre could not be found.',
        noIndex: true
      });
    }

    return constructGenreMetadata({
      name: genre.name,
      slug: genre.slug,
      description: genre.description,
      mangaCount: undefined, // We don't have this info at metadata generation time
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return constructMetadata({
      title: `Manga by Genre | ${seoConfig.site.name}`,
      description: `Browse manga by genre on ${seoConfig.site.name}. Find and read your favorite manga series by genre.`,
      keywords: ['manga genres', 'manga categories', 'manga by genre', 'read manga online', seoConfig.site.name.toLowerCase()]
    });
  }
}

// Fetch manga by genre using centralized API client
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
    // Use centralized API client with built-in ISR caching
    const data = await genreApi.getMangaByGenre(genre, {
      page,
      limit,
      sort,
    });

    // Transform API data to match our component needs
    const manga = data.comics.map((comic: any) => {
      // Extract genres from Comic_Genres
      const genres = comic.Comic_Genres.map((cg: any) => cg.Genres.name);

      // Get latest chapter if available (removed unused variable)

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
        latestChapter: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].title
          : undefined,
        latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].slug
          : undefined,
        updatedAt: comic.last_chapter_uploaded_at || undefined,
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

// Fetch genre info using centralized API client
async function fetchGenreInfo(slug: string) {
  try {
    // Use centralized API client with built-in ISR caching
    const data = await genreApi.getList();
    return data.genres.find((g: any) => g.slug === slug);
  } catch (error) {
    console.error('Error fetching genre info:', error);
    return null;
  }
}

export default async function GenrePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const searchParamsData = await searchParams;

  // Extract search parameters safely
  const sortParam = searchParamsData['sort'];
  const sort = typeof sortParam === 'string' ? sortParam : 'latest';

  const pageParam = searchParamsData['page'];
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

  // Tạo JSON-LD cho trang thể loại
  const jsonLd = generateGenreJsonLd(genre.name, genre.slug);

  return (
    <div className="container mx-auto py-8">
      <JsonLdScript id="genre-jsonld" jsonLd={jsonLd} />
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

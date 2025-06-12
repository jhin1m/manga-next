import { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMangaMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateMangaJsonLd } from "@/lib/seo/jsonld";
import { mangaApi } from '@/lib/api/client';
import MangaDetailClient from "@/components/manga/MangaDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Enable ISR for manga detail pages - revalidate every hour
export const revalidate = 3600;

// Generate static params for popular manga
export async function generateStaticParams() {
  try {
    // Pre-generate top 50 popular manga for instant loading
    const popularManga = await mangaApi.getList({
      sort: 'popular',
      limit: 50,
    });

    return popularManga.comics.map((manga: any) => ({
      slug: manga.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for manga:', error);
    // Return empty array if error - pages will be generated on-demand
    return [];
  }
}

// Server-side function to get initial favorite status
async function getInitialFavoriteStatus(mangaId: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return false;
    }

    const userId = parseInt(session.user.id);
    const favorite = await prisma.favorites.findUnique({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: mangaId,
        },
      },
    });

    return !!favorite;
  } catch (error) {
    console.error('Error fetching initial favorite status:', error);
    return false;
  }
}

// Server-side function to get initial rating data
async function getInitialRatingData(mangaId: number) {
  try {
    const session = await getServerSession(authOptions);

    // Get average rating and total count
    const ratingStats = await prisma.ratings.aggregate({
      where: { comic_id: mangaId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    let userRating = 0;
    if (session?.user) {
      const userId = parseInt(session.user.id);
      const userRatingRecord = await prisma.ratings.findUnique({
        where: {
          user_id_comic_id: {
            user_id: userId,
            comic_id: mangaId,
          },
        },
      });
      userRating = userRatingRecord?.rating || 0;
    }

    return {
      averageRating: ratingStats._avg.rating || 0,
      totalRatings: ratingStats._count.rating || 0,
      userRating,
    };
  } catch (error) {
    console.error('Error fetching initial rating data:', error);
    return {
      averageRating: 0,
      totalRatings: 0,
      userRating: 0,
    };
  }
}

// Fetch manga data from API using centralized API client
async function getMangaBySlug(slug: string) {
  try {
    // Use centralized API client with built-in ISR caching
    const data = await mangaApi.getDetail(slug);

    // Transform API data to match our component needs
    return {
      id: data.manga.id,
      title: data.manga.title,
      alternativeTitles: data.manga.alternative_titles ?
        Object.values(data.manga.alternative_titles as Record<string, string>) : [],
      coverImage: data.manga.cover_image_url || 'https://placehold.co/300x450/png',
      slug: data.manga.slug,
      author: data.manga.Comic_Authors?.map((ca: any) => ca.Authors.name).join(', '),
      artist: data.manga.Comic_Authors?.map((ca: any) => ca.Authors.name).join(', '),
      description: data.manga.description,
      genres: data.manga.Comic_Genres?.map((cg: any) => ({
        name: cg.Genres.name,
        slug: cg.Genres.slug
      })) || [],
      status: data.manga.status,
      views: data.manga.total_views || 0,
      favorites: data.manga.total_favorites || 0,
      chapterCount: 0, // Will be updated when we fetch chapters
      updatedAt: data.manga.last_chapter_uploaded_at || null,
      publishedYear: data.manga.release_date ?
        new Date(data.manga.release_date).getFullYear() : '',
      serialization: data.manga.Comic_Publishers?.map((cp: any) => cp.Publishers.name).join(', '),
    };
  } catch (error) {
    console.error('Error fetching manga:', error);
    return null;
  }
}

// Fetch chapters from API using centralized API client
async function getChapters(slug: string) {
  try {
    // Use centralized API client with built-in ISR caching
    const data = await mangaApi.getChapters(slug);

    // Transform API data to match our component needs (preserve existing logic)
    return data.chapters.map((chapter: any) => ({
      id: chapter.id.toString(),
      number: parseFloat(chapter.chapter_number),
      title: chapter.title || `Chapter ${chapter.chapter_number}`,
      slug: chapter.slug,
      releaseDate: chapter.release_date,
      views: chapter.view_count || 0,
    }));
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
}

// Parallel data fetching for manga detail page
async function fetchAllMangaDetailData(slug: string) {
  try {
    // Fetch manga data first to get genres for related manga
    const manga = await getMangaBySlug(slug);
    if (!manga) {
      return null;
    }

    // Fetch chapters, related manga, and initial user data in parallel
    const [chapters, relatedManga, initialFavoriteStatus, initialRatingData] = await Promise.all([
      getChapters(slug).catch(err => {
        console.error('Error fetching chapters:', err);
        return [];
      }),
      getRelatedManga(slug, manga.genres).catch(err => {
        console.error('Error fetching related manga:', err);
        return [];
      }),
      getInitialFavoriteStatus(manga.id).catch(err => {
        console.error('Error fetching initial favorite status:', err);
        return false;
      }),
      getInitialRatingData(manga.id).catch(err => {
        console.error('Error fetching initial rating data:', err);
        return { averageRating: 0, totalRatings: 0, userRating: 0 };
      })
    ]);

    manga.chapterCount = chapters.length;

    return {
      manga,
      chapters,
      relatedManga,
      initialFavoriteStatus,
      initialRatingData
    };
  } catch (error) {
    console.error('Error fetching manga detail data:', error);
    return null;
  }
}

// Fetch related manga from API using centralized API client
async function getRelatedManga(slug: string, genres: { name: string; slug: string }[]) {
  try {
    // Use the first genre slug to find related manga
    const genreSlug = genres.length > 0 ? genres[0].slug : '';

    // Use centralized API client with built-in ISR caching
    const data = await mangaApi.getList({
      genre: genreSlug,
      limit: 5,
    });

    // Filter out the current manga and transform data
    return data.comics
      .filter((comic: any) => comic.slug !== slug)
      .slice(0, 5)
      .map((comic: any) => ({
        id: comic.id.toString(),
        title: comic.title,
        coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
        slug: comic.slug,
        latestChapter: `Chapter ${comic.Chapters?.[0]?.chapter_number || '?'}`,
        genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
        views: comic.total_views || 0,
        chapterCount: comic.Chapters?.length || 0,
        updatedAt: comic.last_chapter_uploaded_at || null,
        status: comic.status || 'Ongoing',
      }));
  } catch (error) {
    console.error('Error fetching related manga:', error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const manga = await getMangaBySlug(slug);

  if (!manga) {
    return {
      title: 'Manga Not Found',
      description: 'The requested manga could not be found.',
      robots: { index: false, follow: false }
    };
  }

  // Sử dụng utility function để tạo metadata chuẩn SEO
  return constructMangaMetadata({
    title: manga.title,
    description: manga.description,
    coverImage: manga.coverImage,
    author: manga.author,
    genres: manga.genres,
    alternativeTitles: manga.alternativeTitles || [],
    status: manga.status,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: manga.slug,
  });
}

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch all data in parallel
  const data = await fetchAllMangaDetailData(slug);

  if (!data) {
    notFound();
  }

  const { manga, chapters, relatedManga, initialFavoriteStatus, initialRatingData } = data;

  // Tạo JSON-LD cho trang manga
  const jsonLd = generateMangaJsonLd({
    title: manga.title,
    description: manga.description,
    coverImage: manga.coverImage,
    author: manga.author,
    genres: manga.genres,
    alternativeTitles: manga.alternativeTitles || [],
    status: manga.status,
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: manga.slug,
  });

  return (
    <div>
      <JsonLdScript id="manga-jsonld" jsonLd={jsonLd} />
      <MangaDetailClient
        manga={manga}
        chapters={chapters}
        relatedManga={relatedManga}
        initialFavoriteStatus={initialFavoriteStatus}
        initialRatingData={initialRatingData}
      />
    </div>
  );
}

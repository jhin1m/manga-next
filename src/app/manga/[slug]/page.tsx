import { Metadata } from "next";
import MangaChapterList from "@/components/manga/MangaChapterList";
import RelatedManga from "@/components/manga/RelatedManga";
import Description from "@/components/manga/Description";
import CommentSection from "@/components/feature/comments/CommentSection";
import { MangaDetailInfo } from "@/components/manga/MangaDetailInfo";
import { notFound } from "next/navigation";
import { constructMangaMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateMangaJsonLd } from "@/lib/seo/jsonld";
import { mangaApi } from '@/lib/api/client';

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
      author: data.manga.Comic_Authors?.map((ca: any) => ca.Authors.name).join(', ') || 'Unknown',
      artist: data.manga.Comic_Authors?.map((ca: any) => ca.Authors.name).join(', ') || 'Unknown',
      description: data.manga.description || 'No description available.',
      genres: data.manga.Comic_Genres?.map((cg: any) => ({
        name: cg.Genres.name,
        slug: cg.Genres.slug
      })) || [],
      status: data.manga.status || 'Unknown',
      views: data.manga.total_views || 0,
      favorites: data.manga.total_favorites || 0,
      chapterCount: 0, // Will be updated when we fetch chapters
      updatedAt: data.manga.last_chapter_uploaded_at || null,
      publishedYear: data.manga.release_date ?
        new Date(data.manga.release_date).getFullYear() : 'Unknown',
      serialization: data.manga.Comic_Publishers?.map((cp: any) => cp.Publishers.name).join(', ') || 'Unknown',
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
  const manga = await getMangaBySlug(slug);

  if (!manga) {
    notFound();
  }

  // Fetch chapters and related manga in parallel
  const [chapters, relatedManga] = await Promise.all([
    getChapters(slug),
    getRelatedManga(slug, manga.genres),
  ]);

  manga.chapterCount = chapters.length;

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
    <div className="space-y-8">
      <JsonLdScript id="manga-jsonld" jsonLd={jsonLd} />
      {/* Manga Information Section */}
      <MangaDetailInfo manga={manga} chapters={chapters} />

      {/* Description here */}
      <Description description={manga.description} />


      {/* Chapters and Related Manga Section - 2/3 and 1/3 layout for PC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapters Section - 2/3 width on PC */}
        <section className="lg:col-span-2">
          <MangaChapterList
            mangaSlug={manga.slug}
            chapters={chapters}
          />
        </section>

        {/* Related Manga Section - 1/3 width on PC */}
        <section className="lg:col-span-1">
          <RelatedManga relatedManga={relatedManga} />
        </section>
      </div>

      {/* Comments Section */}
      <section className="mt-8">
        <CommentSection
          mangaId={manga.id}
          mangaSlug={manga.slug}
          defaultViewMode="all"
          hideToggle={true}
          paginationType="cursor"
        />
      </section>
    </div>
  );
}

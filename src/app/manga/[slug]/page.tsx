import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, BookOpen, Heart } from "lucide-react";
import MangaChapterList from "@/components/manga/MangaChapterList";
import RelatedManga from "@/components/manga/RelatedManga";
import Description from "@/components/manga/Description";
import { notFound } from "next/navigation";
import { constructMangaMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateMangaJsonLd } from "@/lib/seo/jsonld";
import { formatDate, formatViews } from "@/lib/utils/format";

// Fetch manga data from API
async function getMangaBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch manga data');
    }

    const data = await res.json();

    // Transform API data to match our component needs
    return {
      id: data.manga.id.toString(),
      title: data.manga.title,
      alternativeTitles: data.manga.alternative_titles ?
        Object.values(data.manga.alternative_titles as Record<string, string>) : [],
      coverImage: data.manga.cover_image_url || 'https://placehold.co/300x450/png',
      slug: data.manga.slug,
      author: data.manga.Comic_Authors?.map((ca: any) => ca.Authors.name).join(', ') || 'Unknown',
      artist: data.manga.Comic_Authors?.map((ca: any) => ca.Authors.name).join(', ') || 'Unknown',
      description: data.manga.description || 'No description available.',
      genres: data.manga.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
      status: data.manga.status || 'Unknown',
      rating: 8.5, // Placeholder as it's not in the API
      views: data.manga.total_views || 0,
      favorites: data.manga.total_favorites || 0,
      chapterCount: 0, // Will be updated when we fetch chapters
      updatedAt: data.manga.last_chapter_uploaded_at ?
        formatDate(data.manga.last_chapter_uploaded_at) : 'Unknown',
      publishedYear: data.manga.release_date ?
        new Date(data.manga.release_date).getFullYear() : 'Unknown',
      serialization: data.manga.Comic_Publishers?.map((cp: any) => cp.Publishers.name).join(', ') || 'Unknown',
    };
  } catch (error) {
    console.error('Error fetching manga:', error);
    return null;
  }
}

// Fetch chapters from API
async function getChapters(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga/${slug}/chapters`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch chapters');
    }

    const data = await res.json();

    // Transform API data to match our component needs
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

// Fetch related manga from API
async function getRelatedManga(slug: string, genres: string[]) {
  try {
    // Use the first genre to find related manga
    const genre = genres.length > 0 ? genres[0].toLowerCase() : '';

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga?genre=${genre}&limit=5`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch related manga');
    }

    const data = await res.json();

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
        rating: 8.5, // Placeholder
        views: comic.total_views || 0,
        chapterCount: comic.Chapters?.length || 0,
        updatedAt: comic.last_chapter_uploaded_at ?
          formatDate(comic.last_chapter_uploaded_at) : 'Recently',
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
    image: manga.coverImage,
    keywords: [
      manga.title,
      ...manga.alternativeTitles || [],
      ...manga.genres,
      manga.author,
      'manga', 'read online', 'free manga'
    ],
    type: 'article'
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
    slug: manga.slug,
    genres: manga.genres,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return (
    <div className="space-y-8">
      <JsonLdScript id="manga-jsonld" jsonLd={jsonLd} />
      {/* Manga Information Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-14">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Manga Details */}
        <div className="md:col-span-3 space-y-4">
          <h1 className="text-3xl font-bold">{manga.title}</h1>

          {manga.alternativeTitles && manga.alternativeTitles.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Alternative Titles: {manga.alternativeTitles.join(", ")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {manga.genres.map((genre: string) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{manga.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatViews(manga.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{manga.chapterCount} chapters</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{formatViews(manga.favorites)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="font-medium">{manga.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Author:</span>{" "}
              <span className="font-medium">{manga.author}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Artist:</span>{" "}
              <span className="font-medium">{manga.artist}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Published:</span>{" "}
              <span className="font-medium">{manga.publishedYear}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Serialization:</span>{" "}
              <span className="font-medium">{manga.serialization}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>{" "}
              <span className="font-medium">{manga.updatedAt}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/manga/${manga.slug}/${chapters.length > 0 ? chapters[chapters.length - 1].slug : '#'}`}>
                Read First Chapter
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/manga/${manga.slug}/${chapters.length > 0 ? chapters[0].slug : '#'}`}>
                Read Latest Chapter
              </Link>
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" /> Add to Favorites
            </Button>
          </div>


        </div>
      </section>

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
    </div>
  );
}

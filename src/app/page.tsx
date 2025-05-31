import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateHomeJsonLd } from "@/lib/seo/jsonld";
import HotMangaSlider from "@/components/feature/HotMangaSlider";
import LatestUpdateMangaList from "@/components/feature/LatestUpdateMangaList";
import Sidebar from "@/components/feature/Sidebar";
import Link from "next/link";
import { seoConfig, getSiteUrl } from "@/config/seo.config";

import { mangaApi } from '@/lib/api/client';

// Fetch manga data from API using centralized API client
async function fetchMangaData(sort: string = 'latest', limit: number = 20, page: number = 1) {
  try {
    const sortParam = sort === 'latest' ? 'latest' :
                      sort === 'popular' ? 'popular' : 'alphabetical';

    // Use centralized API client with built-in ISR caching
    const data = await mangaApi.getList({
      sort: sortParam,
      limit,
      page,
    });

    // Transform API data to match component needs (preserve existing logic)
    return {
      manga: data.comics.map((comic: any) => ({
        id: comic.id.toString(),
        title: comic.title,
        coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
        slug: comic.slug,
        latestChapter: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].title
          : undefined,
        latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
          ? comic.Chapters[0].slug
          : undefined,
        genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
        rating: comic.rating || Math.floor(Math.random() * 2) + 8, // Fallback random rating between 8-10
        views: comic.total_views || 0,
        chapterCount: comic._chapterCount || 0,
        updatedAt: comic.last_chapter_uploaded_at || undefined,
        status: comic.status || 'Ongoing',
      })),
      totalPages: Math.ceil(data.total / limit) || 1,
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching manga data:', error);
    return { manga: [], totalPages: 1, currentPage: 1 };
  }
}


// Tạo metadata cho trang chủ
export const metadata: Metadata = constructMetadata({
  title: seoConfig.seo.defaultTitle,
  description: seoConfig.site.description,
  keywords: [...seoConfig.site.keywords, 'latest manga', 'popular manga', 'completed manga'],
  canonical: getSiteUrl(),
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Get the current page from the URL query parameters
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  // Tạo JSON-LD cho trang chủ
  const jsonLd = generateHomeJsonLd();

  // Fetch data for the latest manga with pagination
  await fetchMangaData('latest', 20, currentPage);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <JsonLdScript id="home-jsonld" jsonLd={jsonLd} />

      {/* Hot Manga Slider */}
      <HotMangaSlider />

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content */}
        <section className="space-y-6">
          {/* Latest Update Manga List */}
          <LatestUpdateMangaList page={currentPage} limit={20} />

          {/* View More Button */}
          <div className="flex justify-center mt-8">
            <Link href="/manga?page=2" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-md text-center transition-colors duration-200">
              View more manga
            </Link>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 lg:block">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}

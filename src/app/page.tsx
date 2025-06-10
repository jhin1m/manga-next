import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateHomeJsonLd } from "@/lib/seo/jsonld";
import HomePageWithNavigation from "@/components/feature/HomePageWithNavigation";
import { seoConfig, getSiteUrl } from "@/config/seo.config";
import { defaultViewport } from "@/lib/seo/viewport";

import { mangaApi, rankingsApi, commentApi } from '@/lib/api/client';

// Parallel data fetching for all homepage components
async function fetchAllHomePageData(page: number = 1) {
  try {
    // Fetch all data in parallel for maximum performance
    const [
      hotMangaData,
      latestMangaData,
      sidebarRankingsData,
      recentCommentsData,
      recommendedMangaData
    ] = await Promise.all([
      // Hot manga for slider
      mangaApi.getList({
        sort: 'popular',
        limit: 10,
      }).catch(err => {
        console.error('Error fetching hot manga:', err);
        return { comics: [] };
      }),

      // Latest manga for main list
      mangaApi.getList({
        sort: 'latest',
        limit: 24,
        page,
      }).catch(err => {
        console.error('Error fetching latest manga:', err);
        return { comics: [], totalPages: 1, currentPage: 1, total: 0 };
      }),

      // Sidebar rankings data
      rankingsApi.getSidebarRankings({
        period: 'weekly',
        limit: 10
      }).catch(err => {
        console.error('Error fetching rankings:', err);
        return { success: false, data: { rankings: [] } };
      }),

      // Recent comments for sidebar
      commentApi.getRecent({ limit: 5 }).catch(err => {
        console.error('Error fetching recent comments:', err);
        return { comments: [] };
      }),

      // Recommended manga for sidebar
      mangaApi.getList({
        sort: 'popular',
        limit: 5,
      }).catch(err => {
        console.error('Error fetching recommended manga:', err);
        return { comics: [] };
      })
    ]);

    return {
      hotManga: transformHotMangaData(hotMangaData.comics),
      latestManga: transformLatestMangaData(latestMangaData.comics),
      latestMangaPagination: {
        totalPages: latestMangaData.totalPages || 1,
        currentPage: latestMangaData.currentPage || 1,
        totalResults: latestMangaData.total || 0
      },
      sidebarData: {
        rankings: transformRankingsData(sidebarRankingsData.success ? sidebarRankingsData.data.rankings : []),
        recentComments: recentCommentsData.comments || [],
        recommendedManga: transformRecommendedMangaData(recommendedMangaData.comics)
      }
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      hotManga: [],
      latestManga: [],
      latestMangaPagination: { totalPages: 1, currentPage: 1, totalResults: 0 },
      sidebarData: {
        rankings: [],
        recentComments: [],
        recommendedManga: []
      }
    };
  }
}

// Transform functions for data consistency
function transformHotMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    slug: comic.slug,
    coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
    rating: comic.rating || 8.0,
    views: comic.total_views || 0,
    status: comic.status || 'Ongoing',
    chapterCount: comic._chapterCount || 0,
    latestChapter: comic.Chapters && comic.Chapters.length > 0
      ? comic.Chapters[0].title
      : undefined,
    latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
      ? comic.Chapters[0].slug
      : undefined,
    updatedAt: comic.last_chapter_uploaded_at || comic.Chapters?.[0]?.release_date || undefined,
    genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || []
  }));
}

function transformLatestMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
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
    rating: comic.rating,
    views: comic.total_views || 0,
    chapterCount: comic._chapterCount || 0,
    updatedAt: comic.last_chapter_uploaded_at || undefined,
    status: comic.status || 'Ongoing',
  }));
}

function transformRankingsData(rankings: any[]) {
  return rankings.map((manga: any, index: number) => ({
    id: manga.id?.toString() || manga.comic_id?.toString() || index.toString(),
    title: manga.title,
    slug: manga.slug,
    coverImage: manga.cover_image_url || manga.coverImage || 'https://placehold.co/100x150/png',
    views: manga.total_views || manga.views || 0,
    rank: index + 1
  }));
}

function transformRecommendedMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    slug: comic.slug,
    coverImage: comic.cover_image_url || 'https://placehold.co/100x150/png',
    rating: comic.rating || 0,
    status: comic.status || 'Updating',
    views: comic.total_views || 0,
    genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || ['Action', 'Adventure'],
    latestChapter: comic.Chapters && comic.Chapters.length > 0
      ? {
          number: parseFloat(comic.Chapters[0].chapter_number),
          title: comic.Chapters[0].title,
          updatedAt: comic.Chapters[0].release_date || new Date().toISOString()
        }
      : null
  }));
}

// Tạo metadata cho trang chủ
export const metadata: Metadata = constructMetadata({
  title: seoConfig.seo.defaultTitle,
  description: seoConfig.site.description,
  keywords: [...seoConfig.site.keywords, 'latest manga', 'popular manga', 'completed manga'],
  canonical: getSiteUrl(),
});

export const viewport = defaultViewport;

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

  // Fetch all homepage data in parallel
  const { hotManga, latestManga, latestMangaPagination, sidebarData } = await fetchAllHomePageData(currentPage);

  const initialData = {
    hotManga,
    latestManga,
    latestMangaPagination,
    sidebarData
  };

  return (
    <>
      <JsonLdScript id="home-jsonld" jsonLd={jsonLd} />
      <HomePageWithNavigation initialData={initialData} />
    </>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { mangaApi, rankingsApi, commentApi } from '@/lib/api/client';

// Transform functions (copied from page.tsx for consistency)
function transformHotMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
    slug: comic.slug,
    rating: comic.average_rating || 8,
    views: comic.total_views || 0,
    status: comic.status,
    chapterCount: comic.chapter_count || 0,
    latestChapter:
      comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].title : undefined,
    latestChapterSlug:
      comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].slug : undefined,
    updatedAt: comic.last_chapter_uploaded_at,
  }));
}

function transformLatestMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
    slug: comic.slug,
    latestChapter:
      comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].title : undefined,
    latestChapterSlug:
      comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].slug : undefined,
    genres: comic.genres?.map((g: any) => g.name) || [],
    rating: comic.average_rating || 8,
    views: comic.total_views || 0,
    chapterCount: comic.chapter_count || 0,
    updatedAt: comic.last_chapter_uploaded_at,
    status: comic.status,
  }));
}

function transformRankingsData(rankings: any[]) {
  return rankings.map((item: any, index: number) => ({
    id: item.id.toString(),
    title: item.title,
    slug: item.slug,
    coverImage: item.cover_image_url || 'https://placehold.co/100x150/png',
    views: item.weekly_views || item.total_views || 0, // Use weekly_views first, fallback to total_views
    rank: item.rank || index + 1, // Use API rank if available, otherwise calculate
  }));
}

function transformRecommendedMangaData(comics: any[]) {
  return comics.slice(0, 5).map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    slug: comic.slug,
    coverImage: comic.cover_image_url || 'https://placehold.co/100x150/png',
    rating: comic.average_rating || 8,
    status: comic.status,
    views: comic.total_views || 0,
    genres: comic.genres?.map((g: any) => g.name) || [],
    latestChapter:
      comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].title : undefined,
    latestChapterSlug:
      comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].slug : undefined,
  }));
}

// Parallel data fetching function (copied from page.tsx)
async function fetchAllHomePageData(page: number = 1) {
  try {
    const [popularMangaData, latestMangaData, sidebarRankingsData, recentCommentsData] =
      await Promise.all([
        mangaApi
          .getList({
            sort: 'popular',
            limit: 10,
          })
          .catch(err => {
            console.error('Error fetching popular manga:', err);
            return { comics: [] };
          }),

        mangaApi
          .getList({
            sort: 'latest',
            limit: 24,
            page,
          })
          .catch(err => {
            console.error('Error fetching latest manga:', err);
            return { comics: [], totalPages: 1, currentPage: 1, total: 0 };
          }),

        rankingsApi
          .getSidebarRankings({
            period: 'weekly',
            limit: 10,
          })
          .catch(err => {
            console.error('Error fetching rankings:', err);
            return { success: false, data: { rankings: [] } };
          }),

        commentApi.getRecent({ limit: 5 }).catch(err => {
          console.error('Error fetching recent comments:', err);
          return { comments: [] };
        }),
      ]);

    const hotMangaComics = popularMangaData.comics || [];
    const recommendedMangaComics = popularMangaData.comics || [];

    return {
      hotManga: transformHotMangaData(hotMangaComics),
      latestManga: transformLatestMangaData(latestMangaData.comics),
      latestMangaPagination: {
        totalPages: latestMangaData.totalPages || 1,
        currentPage: latestMangaData.currentPage || 1,
        totalResults: latestMangaData.total || 0,
      },
      sidebarData: {
        rankings: transformRankingsData(
          sidebarRankingsData.success ? sidebarRankingsData.data.rankings : []
        ),
        recentComments: recentCommentsData.comments || [],
        recommendedManga: transformRecommendedMangaData(recommendedMangaComics),
      },
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
        recommendedManga: [],
      },
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;

    const data = await fetchAllHomePageData(page);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Homepage API error:', error);
    return NextResponse.json({ error: 'Failed to fetch homepage data' }, { status: 500 });
  }
}

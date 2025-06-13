import { NextRequest, NextResponse } from 'next/server';
import { mangaApi, rankingsApi, commentApi } from '@/lib/api/client';

/**
 * Home Data API Endpoint
 * Provides fresh data for client-side background updates
 * Used by HomePageOptimized component for real-time updates
 * Optimized to handle background refresh requests efficiently
 */

// Transform functions (same as in page.tsx)
function transformHotMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
    slug: comic.slug,
    latestChapter: comic.Chapters && comic.Chapters.length > 0
      ? (comic.Chapters[0].title || `Chapter ${comic.Chapters[0].chapter_number}`)
      : 'Updating',
    latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
      ? comic.Chapters[0].slug
      : '',
    genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
    rating: 8.5,
    views: comic.total_views || 0,
    chapterCount: comic._chapterCount || 0,
    updatedAt: comic.last_chapter_uploaded_at || undefined,
  }));
}

function transformLatestMangaData(comics: any[]) {
  return comics.map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
    slug: comic.slug,
    latestChapter: comic.Chapters && comic.Chapters.length > 0
      ? (comic.Chapters[0].title || `Chapter ${comic.Chapters[0].chapter_number}`)
      : 'Updating',
    latestChapterSlug: comic.Chapters && comic.Chapters.length > 0
      ? comic.Chapters[0].slug
      : '',
    genres: comic.Comic_Genres?.map((cg: any) => cg.Genres.name) || [],
    rating: 8.5,
    views: comic.total_views || 0,
    chapterCount: comic._chapterCount || 0,
    updatedAt: comic.last_chapter_uploaded_at || undefined,
  }));
}

function transformRankingsData(rankings: any[]) {
  return rankings.map((manga: any) => ({
    id: manga.id.toString(),
    title: manga.title,
    coverImage: manga.cover_image_url || 'https://placehold.co/300x450/png',
    slug: manga.slug,
    views: manga.weekly_views || manga.total_views || 0,
    rating: 8.5,
  }));
}

function transformRecommendedMangaData(comics: any[]) {
  return comics.slice(0, 5).map((comic: any) => ({
    id: comic.id.toString(),
    title: comic.title,
    coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
    slug: comic.slug,
    rating: 8.5,
    views: comic.total_views || 0,
  }));
}

export async function GET(request: NextRequest) {
  try {
    // Get page parameter
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;

    // Check if this is a background refresh request
    const isBackgroundRefresh = request.headers.get('x-background-refresh') === 'true';

    console.log(`🏠 Fetching home data for page ${page} ${isBackgroundRefresh ? '(background refresh)' : '(direct request)'}`);

    // Fetch all data in parallel (same as page.tsx but with no-cache)
    const [
      popularMangaData,
      latestMangaData,
      sidebarRankingsData,
      recentCommentsData
    ] = await Promise.all([
      mangaApi.getList({
        sort: 'popular',
        limit: 10,
      }).catch(err => {
        console.error('Error fetching popular manga:', err);
        return { comics: [] };
      }),

      mangaApi.getList({
        sort: 'latest',
        page: page,
        limit: 24,
      }).catch(err => {
        console.error('Error fetching latest manga:', err);
        return { comics: [], totalPages: 1, currentPage: 1, total: 0 };
      }),

      rankingsApi.getSidebarRankings({
        period: 'weekly',
        limit: 10,
      }).catch(err => {
        console.error('Error fetching sidebar rankings:', err);
        return { success: false, data: { rankings: [] } };
      }),

      commentApi.getRecent({
        limit: 10,
      }).catch(err => {
        console.error('Error fetching recent comments:', err);
        return { comments: [] };
      }),
    ]);

    // Transform data
    const hotMangaComics = popularMangaData.comics || [];
    const recommendedMangaComics = popularMangaData.comics || [];

    const responseData = {
      hotManga: transformHotMangaData(hotMangaComics),
      latestManga: transformLatestMangaData(latestMangaData.comics || []),
      latestMangaPagination: {
        totalPages: latestMangaData.totalPages || 1,
        currentPage: latestMangaData.currentPage || 1,
        totalResults: latestMangaData.total || 0
      },
      sidebarData: {
        rankings: transformRankingsData(sidebarRankingsData.success ? sidebarRankingsData.data.rankings : []),
        recentComments: recentCommentsData.comments || [],
        recommendedManga: transformRecommendedMangaData(recommendedMangaComics)
      }
    };

    // Set appropriate cache headers based on request type
    const cacheHeaders: Record<string, string> = isBackgroundRefresh
      ? {
          // Background refresh - no cache to ensure fresh data
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      : {
          // Direct request - allow short cache for better performance
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
        };

    return NextResponse.json(responseData, {
      headers: cacheHeaders,
    });

  } catch (error) {
    console.error('Home data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    );
  }
}

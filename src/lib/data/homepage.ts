import { mangaApi, rankingsApi, commentApi } from '@/lib/api/client';
import { HomePageData } from '@/hooks/useHomeData';

// Type guard to ensure safe data transformation
function isValidComicData(comic: any): boolean {
  return comic && typeof comic.id !== 'undefined' && typeof comic.title === 'string';
}

function isValidRankingData(ranking: any): boolean {
  return ranking && typeof ranking.id !== 'undefined' && typeof ranking.title === 'string';
}

function isValidCommentData(comment: any): boolean {
  return (
    comment &&
    typeof comment.id !== 'undefined' &&
    typeof comment.content === 'string' &&
    comment.Users &&
    typeof comment.Users.username === 'string'
  );
}

// Transform functions for data consistency
export function transformHotMangaData(comics: any[]) {
  if (!Array.isArray(comics)) return [];
  
  return comics
    .filter(isValidComicData)
    .map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
      slug: comic.slug || '',
      rating: Number(comic.average_rating) || 8,
      views: Number(comic.total_views) || 0,
      status: comic.status || 'unknown',
      chapterCount: Number(comic.chapter_count) || 0,
      latestChapter:
        comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].title : undefined,
      latestChapterSlug:
        comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].slug : undefined,
      updatedAt: comic.last_chapter_uploaded_at,
    }));
}

export function transformLatestMangaData(comics: any[]) {
  if (!Array.isArray(comics)) return [];
  
  return comics
    .filter(isValidComicData)
    .map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      coverImage: comic.cover_image_url || 'https://placehold.co/300x450/png',
      slug: comic.slug || '',
      latestChapter:
        comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].title : undefined,
      latestChapterSlug:
        comic.Chapters && comic.Chapters.length > 0 ? comic.Chapters[0].slug : undefined,
      genres: Array.isArray(comic.genres) ? comic.genres.map((g: any) => g.name || g).filter(Boolean) : [],
      rating: Number(comic.average_rating) || 8,
      views: Number(comic.total_views) || 0,
      chapterCount: Number(comic.chapter_count) || 0,
      updatedAt: comic.last_chapter_uploaded_at,
      status: comic.status || 'unknown',
    }));
}

export function transformRankingsData(rankings: any[]) {
  if (!Array.isArray(rankings)) return [];
  
  return rankings
    .filter(isValidRankingData)
    .map((item: any, index: number) => ({
      id: item.id.toString(),
      title: item.title,
      slug: item.slug || '',
      coverImage: item.cover_image_url || 'https://placehold.co/100x150/png',
      views: Number(item.weekly_views || item.total_views) || 0,
      rank: Number(item.rank) || index + 1,
    }));
}

export function transformRecommendedMangaData(comics: any[]) {
  if (!Array.isArray(comics)) return [];
  
  return comics
    .filter(isValidComicData)
    .slice(0, 5)
    .map((comic: any) => ({
      id: comic.id.toString(),
      title: comic.title,
      slug: comic.slug || '',
      coverImage: comic.cover_image_url || 'https://placehold.co/100x150/png',
      rating: Number(comic.average_rating) || 8,
      status: comic.status || 'unknown',
      views: Number(comic.total_views) || 0,
      genres: Array.isArray(comic.genres) ? comic.genres.map((g: any) => g.name || g).filter(Boolean) : [],
      latestChapter:
        comic.Chapters && comic.Chapters.length > 0
          ? {
              number: Number(comic.Chapters[0].chapter_number) || 1,
              title: comic.Chapters[0].title || '',
              updatedAt: comic.Chapters[0].created_at || new Date().toISOString(),
            }
          : null,
    }));
}

/**
 * Fetch homepage data for SSG at build time
 * This function is used in both page.tsx and API route for consistency
 */
export async function fetchHomePageData(page: number = 1): Promise<HomePageData> {
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
        recentComments: Array.isArray(recentCommentsData.comments) 
          ? recentCommentsData.comments.filter(isValidCommentData) 
          : [],
        recommendedManga: transformRecommendedMangaData(recommendedMangaComics),
      },
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    
    // Return empty data structure to prevent crashes
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

/**
 * Centralized API Client for Manga Website
 * Provides type-safe API endpoints and consistent fetch configuration
 */

// API Configuration
const API_CONFIG = {
  // Use internal URL for server-side requests, public URL for client-side
  baseUrl: typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '')
    : (process.env.NEXT_PUBLIC_API_URL || ''),
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  defaultCacheOptions: {
    manga: { revalidate: 1800, tags: ['manga-list'] as string[] }, // 30 minutes
    mangaDetail: { revalidate: 3600, tags: ['manga-detail'] as string[] }, // 1 hour
    chapters: { revalidate: 3600, tags: ['chapters'] as string[] }, // 1 hour
    chapterContent: { revalidate: 21600, tags: ['chapter-content'] as string[] }, // 6 hours
    genres: { revalidate: 86400, tags: ['genres'] as string[] }, // 24 hours
    search: { revalidate: 900, tags: ['search'] as string[] }, // 15 minutes
  }
} as const;

// API Endpoints - Type-safe and centralized
export const API_ENDPOINTS = {
  // Manga endpoints
  manga: {
    list: '/api/manga',
    detail: (slug: string) => `/api/manga/${slug}`,
    chapters: (slug: string) => `/api/manga/${slug}/chapters`,
  },
  // Chapter endpoints
  chapters: {
    detail: (id: string) => `/api/chapters/${id}`,
  },
  // Genre endpoints
  genres: {
    list: '/api/genres',
    bySlug: (slug: string) => `/api/manga?genre=${slug}`,
  },
  // Search endpoints
  search: {
    manga: '/api/search',
  },
  // Admin endpoints
  admin: {
    crawler: '/api/admin/crawler',
  },
  // Utility endpoints
  health: '/api/health',
  revalidate: '/api/revalidate',
} as const;

// Fetch wrapper with consistent configuration
export async function apiClient<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cache?: 'force-cache' | 'no-store' | 'no-cache';
    next?: {
      revalidate?: number;
      tags?: string[];
    };
    params?: Record<string, string | number | boolean>;
  } = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache,
    next,
    params,
  } = options;

  // Build URL with query parameters
  let url = `${API_CONFIG.baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.defaultHeaders,
      ...headers,
    },
    ...(cache && { cache }),
    ...(next && { next }),
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    // Debug logging for Docker environment
    // if (process.env.NODE_ENV === 'production') {
    //   console.log(`[API Client] Making request to: ${url}`);
    //   console.log(`[API Client] Base URL: ${API_CONFIG.baseUrl}`);
    //   console.log(`[API Client] Is server-side: ${typeof window === 'undefined'}`);
    // }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Client Error for ${url}:`, error);
    console.error(`[API Client] Base URL was: ${API_CONFIG.baseUrl}`);
    console.error(`[API Client] Full URL was: ${url}`);
    throw error;
  }
}

// Specialized API functions with proper typing and caching
export const mangaApi = {
  // Get manga list with filters
  getList: async (params: {
    sort?: string;
    status?: string;
    genre?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    return apiClient(API_ENDPOINTS.manga.list, {
      params,
      next: {
        ...API_CONFIG.defaultCacheOptions.manga,
        tags: [
          'manga-list',
          `manga-${params.sort || 'latest'}`,
          ...(params.genre ? [`manga-genre-${params.genre}`] : []),
          ...(params.status ? [`manga-status-${params.status}`] : []),
        ],
      },
    });
  },

  // Get manga detail by slug
  getDetail: async (slug: string) => {
    return apiClient(API_ENDPOINTS.manga.detail(slug), {
      next: {
        ...API_CONFIG.defaultCacheOptions.mangaDetail,
        tags: ['manga-detail', `manga-${slug}`],
      },
    });
  },

  // Get manga chapters
  getChapters: async (slug: string, params: { page?: number; limit?: number } = {}) => {
    return apiClient(API_ENDPOINTS.manga.chapters(slug), {
      params,
      next: {
        ...API_CONFIG.defaultCacheOptions.chapters,
        tags: ['chapters', `chapters-${slug}`],
      },
    });
  },
};

export const chapterApi = {
  // Get chapter detail
  getDetail: async (id: string) => {
    return apiClient(API_ENDPOINTS.chapters.detail(id), {
      next: {
        ...API_CONFIG.defaultCacheOptions.chapterContent,
        tags: ['chapter-content', `chapter-${id}`],
      },
    });
  },
};

export const genreApi = {
  // Get all genres
  getList: async () => {
    return apiClient(API_ENDPOINTS.genres.list, {
      next: API_CONFIG.defaultCacheOptions.genres,
    });
  },

  // Get manga by genre
  getMangaByGenre: async (slug: string, params: {
    page?: number;
    limit?: number;
    sort?: string;
  } = {}) => {
    return apiClient(API_ENDPOINTS.genres.bySlug(slug), {
      params,
      next: {
        ...API_CONFIG.defaultCacheOptions.manga,
        tags: ['manga-list', `manga-genre-${slug}`, `manga-${params.sort || 'latest'}`],
      },
    });
  },
};

// Revalidation API functions
export const revalidationApi = {
  // Basic revalidation trigger
  trigger: async (options: {
    tags?: string[];
    paths?: string[];
    secret?: string;
    mangaSlug?: string;
    chapterId?: string;
    genreSlug?: string;
  }) => {
    return apiClient(API_ENDPOINTS.revalidate, {
      method: 'POST',
      body: options,
      cache: 'no-store', // Never cache revalidation requests
    });
  },

  // Convenience methods for common revalidation scenarios
  manga: {
    // Revalidate after manga creation/update
    update: async (mangaSlug: string, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        mangaSlug,
        tags: ['manga-list', 'manga-latest', 'manga-popular'],
        paths: ['/manga', '/', `/manga/${mangaSlug}`],
        ...options,
      });
    },

    // Revalidate after chapter creation/update
    addChapter: async (mangaSlug: string, chapterId: string, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        mangaSlug,
        chapterId,
        tags: ['manga-list', 'manga-latest', 'chapter-content'],
        paths: ['/manga', '/', `/manga/${mangaSlug}`],
        ...options,
      });
    },

    // Revalidate after manga deletion
    delete: async (mangaSlug: string, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        tags: ['manga-list', 'manga-latest', 'manga-popular', `manga-${mangaSlug}`],
        paths: ['/manga', '/'],
        ...options,
      });
    },
  },

  genre: {
    // Revalidate after genre update
    update: async (genreSlug: string, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        genreSlug,
        tags: ['genres', 'manga-list'],
        paths: [`/genres/${genreSlug}`],
        ...options,
      });
    },
  },

  // Revalidate everything (use sparingly)
  all: async (options?: { secret?: string }) => {
    return revalidationApi.trigger({
      tags: ['manga-list', 'manga-detail', 'chapter-content', 'genres', 'search'],
      paths: ['/manga', '/', '/genres'],
      ...options,
    });
  },

  // Health check
  health: async () => {
    return apiClient(API_ENDPOINTS.revalidate, {
      method: 'GET',
      cache: 'no-store',
    });
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return apiClient(API_ENDPOINTS.health, {
      cache: 'no-store', // Always fresh for health checks
    });
  },
};

// Search API functions
export const searchApi = {
  // Search manga with query
  searchManga: async (params: {
    q: string;
    limit?: number;
    sort?: string;
  }) => {
    return apiClient(API_ENDPOINTS.search.manga, {
      params,
      next: {
        ...API_CONFIG.defaultCacheOptions.search,
        tags: ['search', `search-${params.q}`],
      },
    });
  },
};

// Export types for better TypeScript support
export type MangaListParams = Parameters<typeof mangaApi.getList>[0];
export type ChapterListParams = Parameters<typeof mangaApi.getChapters>[1];
export type GenreMangaParams = Parameters<typeof genreApi.getMangaByGenre>[1];
export type SearchParams = Parameters<typeof searchApi.searchManga>[0];

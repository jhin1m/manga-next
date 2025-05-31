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
    report: (id: number) => `/api/chapters/${id}/report`,
  },
  // Comment endpoints
  comments: {
    list: '/api/comments',
    recent: '/api/comments/recent',
    create: '/api/comments',
    detail: (id: number) => `/api/comments/${id}`,
    update: (id: number) => `/api/comments/${id}`,
    delete: (id: number) => `/api/comments/${id}`,
    like: (id: number) => `/api/comments/${id}/like`,
    report: (id: number) => `/api/comments/${id}/report`,
  },
  // Favorites endpoints
  favorites: {
    list: '/api/favorites',
    toggle: '/api/favorites',
    check: '/api/favorites/check',
  },
  // Reading progress endpoints
  readingProgress: {
    list: '/api/reading-progress',
    create: '/api/reading-progress',
    sync: '/api/reading-progress/sync',
    delete: (id: number) => `/api/reading-progress/${id}`,
    deleteAll: '/api/reading-progress',
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
  // Auth endpoints
  auth: {
    register: '/api/auth/register',
  },
  // User endpoints
  users: {
    me: '/api/users/me',
    password: '/api/users/me/password',
  },
  // Admin endpoints
  admin: {
    crawler: '/api/admin/crawler',
  },
  // Rating endpoints
  ratings: {
    submit: '/api/ratings',
    get: (mangaId: number) => `/api/ratings/${mangaId}`,
  },
  // Utility endpoints
  health: '/api/health',
  revalidate: '/api/revalidate',
} as const;

// Fetch wrapper with consistent configuration
export async function apiClient<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
      // Try to parse error response body for more details
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`;
          }
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new Error(errorMessage);
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
    return apiClient(API_ENDPOINTS.manga.list, {
      params: {
        genre: slug,
        ...params,
      },
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

// Comment API functions
export const commentApi = {
  // Get comments list
  getList: async (params: {
    comic_id?: number;
    chapter_id?: number;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'oldest' | 'most_liked';
    view_mode?: 'chapter' | 'all';
    pagination_type?: 'offset' | 'cursor';
    cursor?: string;
  } = {}) => {
    return apiClient(API_ENDPOINTS.comments.list, {
      params,
      cache: 'no-store', // Comments should be fresh
    });
  },

  // Get recent comments
  getRecent: async (params: { limit?: number } = {}) => {
    return apiClient(API_ENDPOINTS.comments.recent, {
      params,
      cache: 'no-store', // Comments should be fresh
    });
  },

  // Create comment
  create: async (data: {
    content: string;
    comic_id?: number;
    chapter_id?: number;
    parent_comment_id?: number;
  }) => {
    return apiClient(API_ENDPOINTS.comments.create, {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },

  // Update comment
  update: async (id: number, data: { content: string }) => {
    return apiClient(API_ENDPOINTS.comments.update(id), {
      method: 'PUT',
      body: data,
      cache: 'no-store',
    });
  },

  // Delete comment
  delete: async (id: number) => {
    return apiClient(API_ENDPOINTS.comments.delete(id), {
      method: 'DELETE',
      cache: 'no-store',
    });
  },

  // Like/dislike comment
  like: async (id: number, isLike: boolean) => {
    return apiClient(API_ENDPOINTS.comments.like(id), {
      method: 'POST',
      body: { is_like: isLike },
      cache: 'no-store',
    });
  },

  // Report comment
  report: async (id: number, data: { reason: string; details?: string }) => {
    return apiClient(API_ENDPOINTS.comments.report(id), {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },
};

// Chapter API functions
export const chapterReportApi = {
  // Report chapter
  report: async (id: number, data: { reason: string; details?: string }) => {
    return apiClient(API_ENDPOINTS.chapters.report(id), {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },
};

// Favorites API functions
export const favoritesApi = {
  // Get favorites list
  getList: async (params: { page?: number; limit?: number } = {}) => {
    return apiClient(API_ENDPOINTS.favorites.list, {
      params,
      cache: 'no-store',
    });
  },

  // Toggle favorite
  toggle: async (comicId: number) => {
    return apiClient(API_ENDPOINTS.favorites.toggle, {
      method: 'POST',
      body: { comicId },
      cache: 'no-store',
    });
  },

  // Check favorite status
  check: async (comicId: number) => {
    return apiClient(API_ENDPOINTS.favorites.check, {
      method: 'POST',
      body: { comicId },
      cache: 'no-store',
    });
  },
};

// Helper function for retry logic with exponential backoff
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain error types
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('404')) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Reading Progress API functions
export const readingProgressApi = {
  // Get reading progress list
  getList: async () => {
    return retryApiCall(() =>
      apiClient(API_ENDPOINTS.readingProgress.list, {
        cache: 'no-store',
      })
    );
  },

  // Create/update reading progress with retry logic
  create: async (data: { comicId: number; chapterId?: number }) => {
    return retryApiCall(() =>
      apiClient(API_ENDPOINTS.readingProgress.create, {
        method: 'POST',
        body: data,
        cache: 'no-store',
      }),
      3, // maxRetries
      500 // baseDelay in ms
    );
  },

  // Sync reading progress
  sync: async (progressItems: Array<{
    comic_id: number;
    last_read_chapter_id?: number;
    updated_at: string;
  }>) => {
    return retryApiCall(() =>
      apiClient(API_ENDPOINTS.readingProgress.sync, {
        method: 'POST',
        body: { progressItems },
        cache: 'no-store',
      })
    );
  },

  // Delete specific reading progress
  delete: async (comicId: number) => {
    return apiClient(API_ENDPOINTS.readingProgress.delete(comicId), {
      method: 'DELETE',
      cache: 'no-store',
    });
  },

  // Delete all reading progress
  deleteAll: async () => {
    return apiClient(API_ENDPOINTS.readingProgress.deleteAll, {
      method: 'DELETE',
      cache: 'no-store',
    });
  },
};

// Auth API functions
export const authApi = {
  // Register user
  register: async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    return apiClient(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },
};

// User API functions
export const userApi = {
  // Update user profile
  updateProfile: async (data: {
    username?: string;
    email?: string;
    bio?: string;
    avatar_url?: string;
  }) => {
    return apiClient(API_ENDPOINTS.users.me, {
      method: 'PATCH',
      body: data,
      cache: 'no-store',
    });
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return apiClient(API_ENDPOINTS.users.password, {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },
};

// Rating API functions
export const ratingApi = {
  // Submit or update rating
  submit: async (data: {
    mangaId: number;
    rating: number;
  }) => {
    const response = await apiClient(API_ENDPOINTS.ratings.submit, {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });

    // API returns { success: true, data: {...} } format
    if (response.success && response.data) {
      return response.data;
    }

    // Fallback for unexpected response format
    return response;
  },

  // Get rating statistics for a manga
  get: async (mangaId: number) => {
    const response = await apiClient(API_ENDPOINTS.ratings.get(mangaId), {
      cache: 'no-store',
    });

    // API returns { success: true, data: {...} } format
    if (response.success && response.data) {
      return response.data;
    }

    // Fallback for unexpected response format
    return response;
  },
};

// Export types for better TypeScript support
export type MangaListParams = Parameters<typeof mangaApi.getList>[0];
export type ChapterListParams = Parameters<typeof mangaApi.getChapters>[1];
export type GenreMangaParams = Parameters<typeof genreApi.getMangaByGenre>[1];
export type SearchParams = Parameters<typeof searchApi.searchManga>[0];
export type CommentListParams = Parameters<typeof commentApi.getList>[0];
export type CommentCreateParams = Parameters<typeof commentApi.create>[0];
export type FavoritesListParams = Parameters<typeof favoritesApi.getList>[0];

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
    hotManga: { revalidate: 86400, tags: ['hot-manga'] as string[] }, // 24 hours (1 day)
    mangaDetail: { revalidate: 3600, tags: ['manga-detail'] as string[] }, // 1 hour
    chapters: { revalidate: 3600, tags: ['chapters'] as string[] }, // 1 hour
    chapterContent: { revalidate: 21600, tags: ['chapter-content'] as string[] }, // 6 hours
    genres: { revalidate: 86400, tags: ['genres'] as string[] }, // 24 hours
    search: { revalidate: 900, tags: ['search'] as string[] }, // 15 minutes
    ratings: { revalidate: 86400, tags: ['ratings'] as string[] }, // 24 hours (1 day)
    rankings: {
      daily: { revalidate: 1800, tags: ['rankings', 'rankings-daily'] as string[] }, // 30 minutes
      weekly: { revalidate: 3600, tags: ['rankings', 'rankings-weekly'] as string[] }, // 1 hour
      monthly: { revalidate: 7200, tags: ['rankings', 'rankings-monthly'] as string[] }, // 2 hours
    },
  }
} as const;

// API Endpoints - Type-safe and centralized
export const API_ENDPOINTS = {
  // Manga endpoints
  manga: {
    list: '/api/manga',
    detail: (slug: string) => `/api/manga/${slug}`,
    chapters: (slug: string) => `/api/manga/${slug}/chapters`,
    rankings: '/api/manga/rankings',
    view: (slug: string) => `/api/manga/${slug}/view`,
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
    // Authentication
    login: '/api/admin/auth/login',
    logout: '/api/admin/auth/logout',
    session: '/api/admin/auth/session',

    // Dashboard & Analytics
    dashboard: '/api/admin/dashboard',
    analytics: '/api/admin/analytics',

    // Manga Management
    manga: {
      list: '/api/admin/manga',
      detail: (id: number) => `/api/admin/manga/${id}`,
      create: '/api/admin/manga',
      update: (id: number) => `/api/admin/manga/${id}`,
      delete: (id: number) => `/api/admin/manga/${id}`,
      bulk: '/api/admin/manga/bulk',
      approve: (id: number) => `/api/admin/manga/${id}/approve`,
      reject: (id: number) => `/api/admin/manga/${id}/reject`,
    },

    // Chapter Management
    chapters: {
      list: '/api/admin/chapters',
      detail: (id: number) => `/api/admin/chapters/${id}`,
      create: '/api/admin/chapters',
      update: (id: number) => `/api/admin/chapters/${id}`,
      delete: (id: number) => `/api/admin/chapters/${id}`,
      bulk: '/api/admin/chapters/bulk',
      reorder: '/api/admin/chapters/reorder',
    },

    // User Management
    users: {
      list: '/api/admin/users',
      detail: (id: number) => `/api/admin/users/${id}`,
      create: '/api/admin/users',
      update: (id: number) => `/api/admin/users/${id}`,
      delete: (id: number) => `/api/admin/users/${id}`,
      bulk: '/api/admin/users/bulk',
      ban: (id: number) => `/api/admin/users/${id}/ban`,
      unban: (id: number) => `/api/admin/users/${id}/unban`,
      stats: (id: number) => `/api/admin/users/${id}/stats`,
    },

    // Content Moderation (existing + enhanced)
    comments: {
      list: '/api/admin/comments',
      detail: (id: number) => `/api/admin/comments/${id}`,
      moderate: (id: number) => `/api/admin/comments/${id}`,
      bulk: '/api/admin/comments/bulk',
    },
    reports: {
      chapters: '/api/admin/chapter-reports',
      comments: '/api/admin/comment-reports',
      users: '/api/admin/user-reports',
    },

    // System Management
    system: {
      settings: '/api/admin/system/settings',
      cache: '/api/admin/system/cache',
      maintenance: '/api/admin/system/maintenance',
      backup: '/api/admin/system/backup',
    },

    // File Management
    uploads: {
      manga: '/api/admin/uploads/manga',
      chapters: '/api/admin/uploads/chapters',
      avatars: '/api/admin/uploads/avatars',
    },

    // Legacy
    crawler: '/api/admin/crawler',
  },
  // Rating endpoints
  ratings: {
    submit: '/api/ratings',
    get: (mangaId: number) => `/api/ratings/${mangaId}`,
  },
  // Notification endpoints
  notifications: {
    list: '/api/notifications',
    unreadCount: '/api/notifications/unread-count',
    markRead: '/api/notifications/mark-read',
    settings: '/api/notifications/settings',
    trigger: '/api/notifications/trigger',
    test: '/api/notifications/test',
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
}

// Specialized API functions with proper typing and caching
export const mangaApi = {
  // Get manga list with filters - OPTIMIZED caching
  getList: async (params: {
    sort?: string;
    status?: string;
    genre?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    // Use special cache for hot manga (popular sort)
    const cacheOptions = params.sort === 'popular'
      ? API_CONFIG.defaultCacheOptions.hotManga
      : API_CONFIG.defaultCacheOptions.manga;

    // Create more specific cache tags to avoid conflicts between different limits
    const baseTags = params.sort === 'popular' ? ['hot-manga'] : ['manga-list'];
    const sortTag = `manga-${params.sort || 'latest'}`;
    const limitTag = params.limit ? `manga-limit-${params.limit}` : '';
    const genreTag = params.genre ? `manga-genre-${params.genre}` : '';
    const statusTag = params.status ? `manga-status-${params.status}` : '';
    const pageTag = params.page && params.page > 1 ? `manga-page-${params.page}` : '';

    return apiClient(API_ENDPOINTS.manga.list, {
      params,
      next: {
        ...cacheOptions,
        tags: [
          ...baseTags,
          sortTag,
          ...(limitTag ? [limitTag] : []),
          ...(genreTag ? [genreTag] : []),
          ...(statusTag ? [statusTag] : []),
          ...(pageTag ? [pageTag] : []),
        ].filter(Boolean), // Remove empty strings
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
        tags: ['manga-list', 'manga-latest', 'manga-popular', 'hot-manga'],
        paths: ['/manga', '/', `/manga/${mangaSlug}`],
        ...options,
      });
    },

    // Revalidate after chapter creation/update
    addChapter: async (mangaSlug: string, chapterId: string, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        mangaSlug,
        chapterId,
        tags: ['manga-list', 'manga-latest', 'hot-manga', 'chapter-content'],
        paths: ['/manga', '/', `/manga/${mangaSlug}`],
        ...options,
      });
    },

    // Revalidate after manga deletion
    delete: async (mangaSlug: string, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        tags: ['manga-list', 'manga-latest', 'manga-popular', 'hot-manga', `manga-${mangaSlug}`],
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

  rating: {
    // Revalidate after rating submission/update
    update: async (mangaSlug: string, mangaId: number, options?: { secret?: string }) => {
      return revalidationApi.trigger({
        mangaSlug,
        tags: ['ratings', `ratings-${mangaId}`, 'manga-detail', `manga-${mangaSlug}`],
        paths: [`/manga/${mangaSlug}`],
        ...options,
      });
    },
  },

  // Revalidate everything (use sparingly)
  all: async (options?: { secret?: string }) => {
    return revalidationApi.trigger({
      tags: ['manga-list', 'manga-detail', 'chapter-content', 'genres', 'search', 'hot-manga', 'ratings'],
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

// Admin API functions
export const adminApi = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string; remember?: boolean }) => {
      return apiClient(API_ENDPOINTS.admin.login, {
        method: 'POST',
        body: credentials,
        cache: 'no-store',
      });
    },
    logout: async () => {
      return apiClient(API_ENDPOINTS.admin.logout, {
        method: 'POST',
        cache: 'no-store',
      });
    },
    getSession: async () => {
      return apiClient(API_ENDPOINTS.admin.session, {
        cache: 'no-store',
      });
    },
    refreshSession: async () => {
      return apiClient(API_ENDPOINTS.admin.session, {
        method: 'POST',
        cache: 'no-store',
      });
    },
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      return apiClient(API_ENDPOINTS.admin.dashboard, {
        cache: 'no-store',
      });
    },
  },

  // Analytics
  analytics: {
    getData: async (params: {
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
      type?: 'views' | 'users' | 'manga' | 'chapters';
    } = {}) => {
      return apiClient(API_ENDPOINTS.admin.analytics, {
        params,
        cache: 'no-store',
      });
    },
  },

  // Manga Management
  manga: {
    getList: async (params: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      status?: string;
    } = {}) => {
      return apiClient(API_ENDPOINTS.admin.manga.list, {
        params,
        cache: 'no-store',
      });
    },
    getDetail: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.manga.detail(id), {
        cache: 'no-store',
      });
    },
    create: async (data: any) => {
      return apiClient(API_ENDPOINTS.admin.manga.create, {
        method: 'POST',
        body: data,
        cache: 'no-store',
      });
    },
    update: async (id: number, data: any) => {
      return apiClient(API_ENDPOINTS.admin.manga.update(id), {
        method: 'PUT',
        body: data,
        cache: 'no-store',
      });
    },
    delete: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.manga.delete(id), {
        method: 'DELETE',
        cache: 'no-store',
      });
    },
    bulkOperation: async (data: {
      action: string;
      ids: number[];
      reason?: string;
      duration?: number;
      notify?: boolean;
    }) => {
      return apiClient(API_ENDPOINTS.admin.manga.bulk, {
        method: 'POST',
        body: data,
        cache: 'no-store',
      });
    },
    approve: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.manga.approve(id), {
        method: 'POST',
        cache: 'no-store',
      });
    },
    reject: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.manga.reject(id), {
        method: 'POST',
        cache: 'no-store',
      });
    },
  },

  // User Management
  users: {
    getList: async (params: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      role?: string;
      status?: string;
    } = {}) => {
      return apiClient(API_ENDPOINTS.admin.users.list, {
        params,
        cache: 'no-store',
      });
    },
    getDetail: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.users.detail(id), {
        cache: 'no-store',
      });
    },
    create: async (data: any) => {
      return apiClient(API_ENDPOINTS.admin.users.create, {
        method: 'POST',
        body: data,
        cache: 'no-store',
      });
    },
    update: async (id: number, data: any) => {
      return apiClient(API_ENDPOINTS.admin.users.update(id), {
        method: 'PUT',
        body: data,
        cache: 'no-store',
      });
    },
    delete: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.users.delete(id), {
        method: 'DELETE',
        cache: 'no-store',
      });
    },
    ban: async (id: number, data: { reason: string; duration?: number; notify?: boolean }) => {
      return apiClient(API_ENDPOINTS.admin.users.ban(id), {
        method: 'POST',
        body: data,
        cache: 'no-store',
      });
    },
    unban: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.users.unban(id), {
        method: 'DELETE',
        cache: 'no-store',
      });
    },
    getStats: async (id: number) => {
      return apiClient(API_ENDPOINTS.admin.users.stats(id), {
        cache: 'no-store',
      });
    },
    bulkOperation: async (data: {
      action: string;
      ids: number[];
      reason?: string;
      duration?: number;
      notify?: boolean;
    }) => {
      return apiClient(API_ENDPOINTS.admin.users.bulk, {
        method: 'POST',
        body: data,
        cache: 'no-store',
      });
    },
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
  // Get recent comments
  getRecent: async (params: { limit?: number } = {}) => {
    return apiClient(API_ENDPOINTS.comments.recent, {
      params,
      next: {
        revalidate: 300, // 5 minutes
        tags: ['comments', 'recent-comments'],
      },
    });
  },

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
      next: {
        revalidate: 300, // 5 minutes
        tags: ['comments'],
      },
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

// Notification API functions
export const notificationApi = {
  // Get notifications list
  getList: async (params: {
    page?: number;
    limit?: number;
    unread_only?: boolean;
  } = {}) => {
    return apiClient(API_ENDPOINTS.notifications.list, {
      params,
      cache: 'no-store',
    });
  },

  // Get unread count only - OPTIMIZED ENDPOINT
  getUnreadCount: async () => {
    return apiClient(API_ENDPOINTS.notifications.unreadCount, {
      cache: 'no-store',
    });
  },

  // Mark notifications as read
  markRead: async (data: {
    notification_ids?: number[];
    mark_all?: boolean;
  }) => {
    return apiClient(API_ENDPOINTS.notifications.markRead, {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },

  // Get notification settings
  getSettings: async () => {
    return apiClient(API_ENDPOINTS.notifications.settings, {
      cache: 'no-store',
    });
  },

  // Update notification settings
  updateSettings: async (data: {
    in_app_notifications?: boolean;
    new_chapter_alerts?: boolean;
  }) => {
    return apiClient(API_ENDPOINTS.notifications.settings, {
      method: 'PATCH',
      body: data,
      cache: 'no-store',
    });
  },

  // Trigger notifications (admin only)
  trigger: async (data: {
    comic_id: number;
    chapter_id: number;
    chapter_slug: string;
    chapter_number: number;
    chapter_title?: string;
  }) => {
    return apiClient(API_ENDPOINTS.notifications.trigger, {
      method: 'POST',
      body: data,
      cache: 'no-store',
    });
  },

  // Get notification statistics (admin only)
  getStatistics: async () => {
    return apiClient(API_ENDPOINTS.notifications.trigger, {
      cache: 'no-store',
    });
  },

  // Test notifications (development only)
  createTest: async (type: 'test' | 'new_chapter' = 'test') => {
    return apiClient(API_ENDPOINTS.notifications.test, {
      method: 'POST',
      body: { type },
      cache: 'no-store',
    });
  },

  // Get test info
  getTestInfo: async () => {
    return apiClient(API_ENDPOINTS.notifications.test, {
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
      next: {
        ...API_CONFIG.defaultCacheOptions.ratings,
        tags: ['ratings', `ratings-${mangaId}`],
      },
    });

    // API returns { success: true, data: {...} } format
    if (response.success && response.data) {
      return response.data;
    }

    // Fallback for unexpected response format
    return response;
  },
};

// Rankings API functions
export const rankingsApi = {
  // Get manga rankings by category and period
  getRankings: async (params: {
    category?: 'most_viewed' | 'highest_rated' | 'most_bookmarked' | 'trending';
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    page?: number;
    limit?: number;
  } = {}) => {
    const {
      category = 'most_viewed',
      period = 'weekly',
      page = 1,
      limit = 10
    } = params;

    // Get appropriate cache options based on period
    const cacheOptions = period === 'all_time'
      ? API_CONFIG.defaultCacheOptions.rankings.monthly // Use monthly cache for all_time
      : API_CONFIG.defaultCacheOptions.rankings[period] || API_CONFIG.defaultCacheOptions.rankings.weekly;

    return apiClient(API_ENDPOINTS.manga.rankings, {
      params: { category, period, page, limit },
      next: {
        ...cacheOptions,
        tags: [
          'rankings',
          `rankings-${category}`,
          `rankings-${period}`,
          `rankings-${category}-${period}`,
          'manga-rankings'
        ],
      },
    });
  },

  // Get rankings for sidebar (simplified)
  getSidebarRankings: async (params: {
    period?: 'daily' | 'weekly' | 'monthly';
    limit?: number;
  } = {}) => {
    const { period = 'weekly', limit = 10 } = params;

    return rankingsApi.getRankings({
      category: 'most_viewed',
      period,
      limit
    });
  },

  // Refresh rankings cache (for admin use)
  refresh: async (options?: { secret?: string }) => {
    return apiClient(API_ENDPOINTS.manga.rankings, {
      method: 'POST',
      body: options,
      cache: 'no-store',
    });
  },
};

// View tracking API functions
export const viewApi = {
  // Track manga view
  trackMangaView: async (slug: string) => {
    return apiClient(API_ENDPOINTS.manga.view(slug), {
      method: 'POST',
      cache: 'no-store',
    });
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
export type RankingsParams = Parameters<typeof rankingsApi.getRankings>[0];

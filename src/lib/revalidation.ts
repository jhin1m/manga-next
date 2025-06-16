/**
 * Revalidation Helper Utilities
 *
 * This module provides helper functions to trigger cache revalidation
 * when data is updated in the database. It integrates with the on-demand
 * revalidation API to solve the issue where PostgreSQL updates don't
 * automatically reflect in the NextJS application.
 */

interface RevalidationOptions {
  tags?: string[];
  paths?: string[];
  mangaSlug?: string;
  chapterId?: string;
  genreSlug?: string;
  secret?: string;
}

interface RevalidationResponse {
  success: boolean;
  message: string;
  timestamp: string;
  revalidated?: {
    tags: string[];
    paths: string[];
    count: number;
  };
  context?: {
    mangaSlug: string | null;
    chapterId: string | null;
    genreSlug: string | null;
  };
  error?: string;
}

/**
 * Main revalidation function
 * Triggers cache revalidation for specified tags, paths, or contexts
 */
export async function triggerRevalidation(
  options: RevalidationOptions
): Promise<RevalidationResponse> {
  const { tags = [], paths = [], mangaSlug, chapterId, genreSlug, secret } = options;

  // Auto-generate tags and paths based on context
  const allTags = [...tags];
  const allPaths = [...paths];

  // Auto-generate tags for manga updates
  if (mangaSlug) {
    allTags.push(
      `manga-${mangaSlug}`,
      'manga-list',
      'manga-detail',
      'manga-latest',
      'manga-popular'
    );
    allPaths.push(`/manga/${mangaSlug}`);
  }

  // Auto-generate tags for chapter updates
  if (chapterId) {
    allTags.push(
      `chapter-${chapterId}`,
      'chapter-content',
      'manga-list' // Chapter updates affect manga list (latest chapter info)
    );
  }

  // Auto-generate tags for genre updates
  if (genreSlug) {
    allTags.push(`manga-genre-${genreSlug}`, 'genres', 'manga-list');
    allPaths.push(`/genres/${genreSlug}`);
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: allTags,
        paths: allPaths,
        mangaSlug,
        chapterId,
        genreSlug,
        secret: secret || process.env.REVALIDATION_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.status} ${response.statusText}`);
    }

    const result: RevalidationResponse = await response.json();
    console.log('✅ Revalidation successful:', result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Revalidation error:', errorMessage);

    return {
      success: false,
      message: 'Revalidation failed',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
}

/**
 * Convenience functions for common revalidation scenarios
 */

// Revalidate after manga creation or update
export async function revalidateManga(mangaSlug: string, options?: { secret?: string }) {
  return triggerRevalidation({
    mangaSlug,
    tags: ['manga-list', 'manga-latest', 'manga-popular'],
    paths: ['/manga', '/', `/manga/${mangaSlug}`],
    ...options,
  });
}

// Revalidate after chapter creation or update
export async function revalidateChapter(
  mangaSlug: string,
  chapterId: string,
  options?: { secret?: string }
) {
  return triggerRevalidation({
    mangaSlug,
    chapterId,
    tags: ['manga-list', 'manga-latest', 'chapter-content'],
    paths: ['/manga', '/', `/manga/${mangaSlug}`],
    ...options,
  });
}

// Revalidate after genre update
export async function revalidateGenre(genreSlug: string, options?: { secret?: string }) {
  return triggerRevalidation({
    genreSlug,
    tags: ['genres', 'manga-list'],
    paths: [`/genres/${genreSlug}`],
    ...options,
  });
}

// Revalidate manga list and homepage (common after bulk updates)
export async function revalidateMangaList(options?: { secret?: string }) {
  return triggerRevalidation({
    tags: ['manga-list', 'manga-latest', 'manga-popular'],
    paths: ['/manga', '/'],
    ...options,
  });
}

// Revalidate search results
export async function revalidateSearch(options?: { secret?: string }) {
  return triggerRevalidation({
    tags: ['search', 'manga-list'],
    ...options,
  });
}

// Revalidate everything (use sparingly - only for major updates)
export async function revalidateAll(options?: { secret?: string }) {
  return triggerRevalidation({
    tags: ['manga-list', 'manga-detail', 'chapter-content', 'genres', 'search'],
    paths: ['/manga', '/', '/genres'],
    ...options,
  });
}

/**
 * Database integration helpers
 * These functions can be called after database operations
 */

// Call after creating a new manga
export async function onMangaCreated(mangaSlug: string) {
  console.log(`🆕 New manga created: ${mangaSlug}`);
  return revalidateManga(mangaSlug);
}

// Call after updating manga information
export async function onMangaUpdated(mangaSlug: string) {
  console.log(`📝 Manga updated: ${mangaSlug}`);
  return revalidateManga(mangaSlug);
}

// Call after deleting a manga
export async function onMangaDeleted(mangaSlug: string) {
  console.log(`🗑️ Manga deleted: ${mangaSlug}`);
  return triggerRevalidation({
    tags: ['manga-list', 'manga-latest', 'manga-popular', `manga-${mangaSlug}`],
    paths: ['/manga', '/'],
  });
}

// Call after adding a new chapter
export async function onChapterAdded(mangaSlug: string, chapterId: string) {
  console.log(`📖 New chapter added: ${mangaSlug} - Chapter ${chapterId}`);
  return revalidateChapter(mangaSlug, chapterId);
}

// Call after updating chapter content
export async function onChapterUpdated(mangaSlug: string, chapterId: string) {
  console.log(`📝 Chapter updated: ${mangaSlug} - Chapter ${chapterId}`);
  return revalidateChapter(mangaSlug, chapterId);
}

// Call after bulk operations (e.g., crawler updates)
export async function onBulkUpdate(type: 'manga' | 'chapters' | 'all' = 'manga') {
  console.log(`🔄 Bulk update completed: ${type}`);

  switch (type) {
    case 'manga':
      return revalidateMangaList();
    case 'chapters':
      return triggerRevalidation({
        tags: ['manga-list', 'chapter-content', 'manga-latest'],
        paths: ['/manga', '/'],
      });
    case 'all':
      return revalidateAll();
    default:
      return revalidateMangaList();
  }
}

/**
 * Health check function
 */
export async function checkRevalidationHealth(): Promise<boolean> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const response = await fetch(`${apiUrl}/api/revalidate`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('❌ Revalidation health check failed:', error);
    return false;
  }
}

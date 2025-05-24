import { prisma } from './db';

/**
 * Check if we're in a build environment with dummy DATABASE_URL
 */
export function isBuildTime(): boolean {
  const dbUrl = process.env.DATABASE_URL || '';
  return dbUrl.includes('dummy') || dbUrl.includes('localhost') && process.env.NODE_ENV !== 'development';
}

/**
 * Safe database query wrapper that returns empty data during build time
 */
export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  fallbackData: T
): Promise<T> {
  if (isBuildTime()) {
    console.log('Build time detected, returning fallback data');
    return fallbackData;
  }

  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query failed:', error);
    return fallbackData;
  }
}

/**
 * Safe Prisma client that returns mock data during build
 */
export const safePrisma = {
  comics: {
    findMany: async (args?: any) => {
      return safeDbQuery(
        () => prisma.comics.findMany(args),
        [] // Empty array as fallback
      );
    },
    findUnique: async (args: any) => {
      return safeDbQuery(
        () => prisma.comics.findUnique(args),
        null // Null as fallback
      );
    },
    count: async (args?: any) => {
      return safeDbQuery(
        () => prisma.comics.count(args),
        0 // Zero as fallback
      );
    }
  },
  genres: {
    findMany: async (args?: any) => {
      return safeDbQuery(
        () => prisma.genres.findMany(args),
        [] // Empty array as fallback
      );
    },
    findUnique: async (args: any) => {
      return safeDbQuery(
        () => prisma.genres.findUnique(args),
        null // Null as fallback
      );
    }
  },
  chapters: {
    findMany: async (args?: any) => {
      return safeDbQuery(
        () => prisma.chapters.findMany(args),
        [] // Empty array as fallback
      );
    }
  }
};

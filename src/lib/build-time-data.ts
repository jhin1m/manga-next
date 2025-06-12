import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

/**
 * Get Prisma client instance for build-time operations
 * Reuses connection to avoid multiple instances
 */
function getBuildTimePrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Disconnect Prisma client after build operations
 */
async function disconnectBuildTimePrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Get popular manga slugs for static generation
 * Used in generateStaticParams for pre-rendering top manga pages
 */
export async function getBuildTimePopularManga(): Promise<{ slug: string }[]> {
  try {
    console.log('🔍 Fetching popular manga for static generation...');
    
    const client = getBuildTimePrisma();
    
    const manga = await client.comics.findMany({
      select: { 
        slug: true,
        title: true, // For logging purposes
      },
      where: { 
        status: 'published',
        slug: {
          not: null,
        },
      },
      orderBy: [
        { view_count: 'desc' },
        { created_at: 'desc' }, // Secondary sort for consistent results
      ],
      take: 50,
    });
    
    console.log(`✅ Found ${manga.length} popular manga for static generation`);
    
    return manga.map(m => ({ slug: m.slug }));
  } catch (error) {
    console.error('❌ Build-time DB error (popular manga):', error);
    return [];
  } finally {
    await disconnectBuildTimePrisma();
  }
}

/**
 * Get all published manga slugs for sitemap generation
 * Optional: Can be used for comprehensive static generation
 */
export async function getBuildTimeAllMangaSlugs(): Promise<{ slug: string }[]> {
  try {
    console.log('🔍 Fetching all manga slugs for build-time operations...');
    
    const client = getBuildTimePrisma();
    
    const manga = await client.comics.findMany({
      select: { slug: true },
      where: { 
        status: 'published',
        slug: {
          not: null,
        },
      },
      orderBy: { created_at: 'desc' },
    });
    
    console.log(`✅ Found ${manga.length} manga slugs`);
    
    return manga.map(m => ({ slug: m.slug }));
  } catch (error) {
    console.error('❌ Build-time DB error (all manga):', error);
    return [];
  } finally {
    await disconnectBuildTimePrisma();
  }
}

/**
 * Get all genre slugs for static generation
 * Used for pre-rendering genre pages
 */
export async function getBuildTimeGenreSlugs(): Promise<{ slug: string }[]> {
  try {
    console.log('🔍 Fetching genre slugs for static generation...');
    
    const client = getBuildTimePrisma();
    
    const genres = await client.genres.findMany({
      select: { slug: true },
      where: {
        slug: {
          not: null,
        },
      },
      orderBy: { name: 'asc' },
    });
    
    console.log(`✅ Found ${genres.length} genre slugs for static generation`);
    
    return genres.map(g => ({ slug: g.slug }));
  } catch (error) {
    console.error('❌ Build-time DB error (genres):', error);
    return [];
  } finally {
    await disconnectBuildTimePrisma();
  }
}

/**
 * Get manga chapters for build-time operations
 * Used for pre-rendering chapter pages of popular manga
 */
export async function getBuildTimeMangaChapters(mangaSlug: string): Promise<{ chapterSlug: string }[]> {
  try {
    console.log(`🔍 Fetching chapters for manga: ${mangaSlug}`);
    
    const client = getBuildTimePrisma();
    
    const chapters = await client.chapters.findMany({
      select: { slug: true },
      where: {
        Comics: {
          slug: mangaSlug,
          status: 'published',
        },
        slug: {
          not: null,
        },
      },
      orderBy: { chapter_number: 'asc' },
      take: 20, // Limit to first 20 chapters for build performance
    });
    
    console.log(`✅ Found ${chapters.length} chapters for ${mangaSlug}`);
    
    return chapters.map(c => ({ chapterSlug: c.slug }));
  } catch (error) {
    console.error(`❌ Build-time DB error (chapters for ${mangaSlug}):`, error);
    return [];
  } finally {
    await disconnectBuildTimePrisma();
  }
}

/**
 * Check if build-time database operations are enabled
 */
export function isBuildTimeStaticGenerationEnabled(): boolean {
  return process.env.SKIP_BUILD_STATIC_GENERATION !== 'true';
}

/**
 * Get build environment info for logging
 */
export function getBuildEnvironmentInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    skipStaticGeneration: process.env.SKIP_BUILD_STATIC_GENERATION,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  };
}

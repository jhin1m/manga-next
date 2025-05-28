import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { getSiteUrl } from '@/config/seo.config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Tạo sitemap động cho trang web
 * Tham khảo: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lấy tất cả manga từ database
  const allManga = await prisma.comics.findMany({
    select: {
      slug: true,
      updated_at: true,
    },
  });

  // Lấy tất cả thể loại từ database
  const allGenres = await prisma.genres.findMany({
    select: {
      slug: true,
      updated_at: true,
    },
  });

  // Tạo URL cho trang chủ và các trang tĩnh
  const staticPages = [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: getSiteUrl('/manga'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: getSiteUrl('/popular'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: getSiteUrl('/completed'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ] as MetadataRoute.Sitemap;

  // Tạo URL cho tất cả manga
  const mangaUrls = allManga.map((manga: { slug: string; updated_at: Date | null }) => ({
    url: getSiteUrl(`/manga/${manga.slug}`),
    lastModified: manga.updated_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  })) as MetadataRoute.Sitemap;

  // Tạo URL cho tất cả thể loại
  const genreUrls = allGenres.map((genre: { slug: string; updated_at: Date | null }) => ({
    url: getSiteUrl(`/genres/${genre.slug}`),
    lastModified: genre.updated_at || new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  })) as MetadataRoute.Sitemap;

  // Kết hợp tất cả URL
  return [...staticPages, ...mangaUrls, ...genreUrls];
}

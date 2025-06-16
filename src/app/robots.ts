import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/config/seo.config';

/**
 * Dynamic robots.txt generation for TruyentranhNuru
 * Automatically uses the correct site URL from SEO configuration
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      // Allow all web crawlers to access the site
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/admin/',
          '/profile/',
          '/debug/',
          '/test-*/',
          '/_next/',
          '/private/',
          '*.json$',
          '*.xml$',
          '*.txt$',
          '*.log$',
        ],
      },
      // Specific rules for major search engines with crawl delay
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/', '/admin/', '/profile/'],
        crawlDelay: 1,
      },
      {
        userAgent: ['Bingbot', 'Slurp'],
        allow: '/',
        disallow: ['/api/', '/auth/', '/admin/', '/profile/'],
        crawlDelay: 2,
      },
      // Block aggressive crawlers and scrapers
      {
        userAgent: ['AhrefsBot', 'MJ12bot', 'DotBot', 'SemrushBot', 'BLEXBot'],
        disallow: '/',
      },
      // Allow social media crawlers for better sharing
      {
        userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp', 'TelegramBot'],
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

/**
 * Enhanced JSON-LD Schema Generation with Centralized Config
 */

import { seoConfig, getSiteUrl } from '@/config/seo.config';
import type {
  MangaJsonLd,
  ChapterJsonLd,
  WebsiteJsonLd,
  OrganizationJsonLd,
  MangaMetadataProps,
  ChapterMetadataProps
} from './types';

// Enhanced manga JSON-LD with proper typing
export function generateMangaJsonLd(data: MangaMetadataProps): string {
  const jsonLd: MangaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: data.title,
    headline: data.title,
    description: data.description || `Read ${data.title} manga online for free on ${seoConfig.site.name}.`,
    image: data.coverImage || getSiteUrl(seoConfig.urls.ogImage),
    author: {
      '@type': 'Person',
      name: data.author || 'Unknown',
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.schema.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: getSiteUrl(seoConfig.urls.logo),
      },
    },
    datePublished: data.publishedAt || new Date().toISOString(),
    dateModified: data.updatedAt || new Date().toISOString(),
    genre: data.genres?.map(genre => genre.name).join(', ') || 'Manga',
    inLanguage: seoConfig.site.language,
    url: getSiteUrl(`/manga/${data.slug}`),
  };

  return JSON.stringify(jsonLd);
}

// Enhanced chapter JSON-LD with proper typing
export function generateChapterJsonLd(data: ChapterMetadataProps): string {
  const jsonLd: ChapterJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    isPartOf: {
      '@type': 'Book',
      name: data.manga.title,
      url: getSiteUrl(`/manga/${data.manga.slug}`),
    },
    name: `Chapter ${data.chapter.number}`,
    headline: `${data.manga.title} - Chapter ${data.chapter.number}`,
    description: `Read ${data.manga.title} Chapter ${data.chapter.number} online for free on ${seoConfig.site.name}.`,
    image: data.chapter.images?.[0] || data.manga.coverImage || getSiteUrl(seoConfig.urls.ogImage),
    datePublished: data.chapter.publishedAt || new Date().toISOString(),
    dateModified: data.chapter.updatedAt || new Date().toISOString(),
    url: getSiteUrl(`/manga/${data.manga.slug}/${data.chapterSlug}`),
    pageStart: 1,
    pageEnd: data.chapter.images?.length || 1,
  };

  return JSON.stringify(jsonLd);
}

// Enhanced website JSON-LD for homepage
export function generateHomeJsonLd(): string {
  const jsonLd: WebsiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.site.name,
    description: seoConfig.site.description,
    url: getSiteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: getSiteUrl('/search?q={search_term_string}'),
      'query-input': 'required name=search_term_string',
    },
  };

  return JSON.stringify(jsonLd);
}

// Enhanced organization JSON-LD
export function generateOrganizationJsonLd(): string {
  const jsonLd: OrganizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.schema.organization.name,
    legalName: seoConfig.schema.organization.legalName,
    url: getSiteUrl(),
    logo: {
      '@type': 'ImageObject',
      url: getSiteUrl(seoConfig.urls.logo),
    },
    foundingDate: seoConfig.schema.organization.foundingDate,
    founders: [...seoConfig.schema.organization.founders],
    address: seoConfig.schema.organization.address,
    contactPoint: {
      ...seoConfig.schema.organization.contactPoint,
      availableLanguage: [...seoConfig.schema.organization.contactPoint.availableLanguage],
    },
  };

  return JSON.stringify(jsonLd);
}

// Enhanced collection page JSON-LD for manga lists
export function generateMangaListJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Manga List - ${seoConfig.site.name}`,
    description: `Browse all manga available on ${seoConfig.site.name}.`,
    url: getSiteUrl('/manga'),
    isPartOf: {
      '@type': 'WebSite',
      name: seoConfig.site.name,
      url: getSiteUrl(),
    },
  };

  return JSON.stringify(jsonLd);
}

// Enhanced genre page JSON-LD
export function generateGenreJsonLd(genreName: string, genreSlug: string): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${genreName} Manga - ${seoConfig.site.name}`,
    description: `Browse all ${genreName} manga available on ${seoConfig.site.name}.`,
    url: getSiteUrl(`/genres/${genreSlug}`),
    isPartOf: {
      '@type': 'WebSite',
      name: seoConfig.site.name,
      url: getSiteUrl(),
    },
  };

  return JSON.stringify(jsonLd);
}

// Search results JSON-LD
export function generateSearchJsonLd(query?: string): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: query ? `Search results for "${query}" - ${seoConfig.site.name}` : `Search - ${seoConfig.site.name}`,
    description: query ? `Find manga with keyword "${query}".` : `Search for manga on ${seoConfig.site.name}.`,
    url: getSiteUrl(query ? `/search?q=${encodeURIComponent(query)}` : '/search'),
    isPartOf: {
      '@type': 'WebSite',
      name: seoConfig.site.name,
      url: getSiteUrl(),
    },
  };

  return JSON.stringify(jsonLd);
}

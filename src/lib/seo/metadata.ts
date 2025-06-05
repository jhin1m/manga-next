import { Metadata } from "next";
import { seoConfig, getSiteUrl, getPageTitle } from '@/config/seo.config';
import { getMangaTemplate, getChapterTemplate, getGenreTemplate, getSearchTemplate, getMangaListTemplate } from './templates';
import type {
  EnhancedMetadataProps,
  MangaMetadataProps,
  ChapterMetadataProps,
  GenreMetadataProps,
  SearchMetadataProps
} from './types';

// Legacy interface for backward compatibility
export interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: string;
  noIndex?: boolean;
}

// Enhanced metadata construction with centralized config
export function constructMetadata({
  title,
  description = seoConfig.site.description,
  keywords = [...seoConfig.site.keywords],
  image = seoConfig.urls.ogImage,
  type = 'website',
  noIndex = false,
  canonical,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  locale = seoConfig.site.locale,
}: EnhancedMetadataProps = {}): Metadata {
  // Use template system for title if not provided
  const finalTitle = title ? getPageTitle(title) : seoConfig.seo.defaultTitle;
  const finalCanonical = canonical || getSiteUrl();
  const finalImage = image.startsWith('http') ? image : getSiteUrl(image);

  // Combine keywords with tags
  const allKeywords = [...keywords, ...tags].filter(Boolean);

  const metadata: Metadata = {
    title: finalTitle,
    description,
    keywords: allKeywords.join(', '),

    openGraph: {
      title: finalTitle,
      description,
      images: [
        {
          url: finalImage,
          width: seoConfig.social.openGraph.type === 'website' ? 1200 : 800,
          height: seoConfig.social.openGraph.type === 'website' ? 630 : 600,
          alt: finalTitle,
        },
      ],
      type: type as 'website' | 'article' | 'book' | 'profile',
      siteName: seoConfig.social.openGraph.siteName,
      locale,
      url: finalCanonical,
    },

    twitter: {
      card: seoConfig.social.twitter.card,
      title: finalTitle,
      description,
      images: [finalImage],
      site: seoConfig.social.twitter.site,
      creator: seoConfig.social.twitter.creator,
    },

    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        ...seoConfig.seo.robots.googleBot,
        index: !noIndex,
        follow: !noIndex,
      },
    },

    alternates: {
      canonical: finalCanonical,
    },

    metadataBase: new URL(seoConfig.urls.base),
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime || author || section)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags: allKeywords,
    };
  }

  return metadata;
}

// Enhanced manga metadata using templates
export function constructMangaMetadata(data: MangaMetadataProps): Metadata {
  const template = getMangaTemplate({
    title: data.title,
    description: data.description,
    genres: data.genres?.map(g => g.name),
    author: data.author,
  });

  return constructMetadata({
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    image: data.coverImage || seoConfig.urls.ogImage,
    type: template.type,
    canonical: getSiteUrl(`/manga/${data.slug}`),
    publishedTime: data.publishedAt,
    modifiedTime: data.updatedAt,
    author: data.author,
    section: 'Manga',
    tags: data.genres?.map(g => g.name) || [],
  });
}

// Enhanced chapter metadata using templates
export function constructChapterMetadata(data: ChapterMetadataProps): Metadata {
  const template = getChapterTemplate({
    mangaTitle: data.manga.title,
    chapterNumber: data.chapter.number,
    chapterTitle: data.chapter.title,
    genres: data.manga.genres?.map(g => g.name),
  });

  return constructMetadata({
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    image: data.chapter.images?.[0] || data.manga.coverImage || seoConfig.urls.ogImage,
    type: template.type,
    canonical: getSiteUrl(`/manga/${data.manga.slug}/${data.chapterSlug}`),
    publishedTime: data.chapter.publishedAt,
    modifiedTime: data.chapter.updatedAt,
    section: 'Chapter',
    tags: data.manga.genres?.map(g => g.name) || [],
  });
}

// Genre metadata using templates
export function constructGenreMetadata(data: GenreMetadataProps): Metadata {
  const template = getGenreTemplate({
    genreName: data.name,
    mangaCount: data.mangaCount,
    description: data.description,
  });

  return constructMetadata({
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    type: template.type,
    canonical: getSiteUrl(`/genres/${data.slug}`),
    section: 'Genre',
  });
}

// Search metadata using templates
export function constructSearchMetadata(data: SearchMetadataProps = {}): Metadata {
  const template = getSearchTemplate({
    query: data.query,
    resultsCount: data.resultsCount,
  });

  const searchPath = data.query ? `/search?q=${encodeURIComponent(data.query)}` : '/search';

  return constructMetadata({
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    type: template.type,
    canonical: getSiteUrl(searchPath),
    noIndex: !data.query, // Don't index empty search pages
  });
}

// Manga list metadata using templates
export function constructMangaListMetadata(data: {
  pageTitle: string;
  totalResults?: number;
  filters?: string[];
  sort?: string;
  status?: string;
  genre?: string;
  page?: number;
}): Metadata {
  const template = getMangaListTemplate({
    pageTitle: data.pageTitle,
    totalResults: data.totalResults,
    filters: data.filters,
    sort: data.sort,
    status: data.status,
    genre: data.genre,
  });

  // Build canonical URL with filters
  const params = new URLSearchParams();
  if (data.sort && data.sort !== 'latest') params.append('sort', data.sort);
  if (data.status && data.status !== 'all') params.append('status', data.status);
  if (data.genre && data.genre !== 'all') params.append('genre', data.genre);
  if (data.page && data.page > 1) params.append('page', data.page.toString());

  const queryString = params.toString();
  const canonicalPath = `/manga${queryString ? `?${queryString}` : ''}`;

  return constructMetadata({
    title: template.title,
    description: template.description,
    keywords: template.keywords,
    type: template.type,
    canonical: getSiteUrl(canonicalPath),
  });
}

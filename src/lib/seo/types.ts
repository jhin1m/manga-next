/**
 * TypeScript definitions for SEO utilities
 */

import { Metadata } from 'next';

// Base metadata props
export interface BaseMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
  noIndex?: boolean;
  canonical?: string;
}

// Enhanced metadata props with more options
export interface EnhancedMetadataProps extends BaseMetadataProps {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

// Manga-specific metadata
export interface MangaMetadataProps {
  title: string;
  description?: string;
  coverImage?: string;
  author?: string;
  genres?: Array<{ name: string; slug: string }>;
  alternativeTitles?: string[];
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
}

// Chapter-specific metadata
export interface ChapterMetadataProps {
  manga: {
    title: string;
    slug: string;
    coverImage?: string;
    genres?: Array<{ name: string; slug: string }>;
  };
  chapter: {
    number: number;
    title?: string;
    images?: string[];
    publishedAt?: string;
    updatedAt?: string;
  };
  chapterSlug: string;
}

// Genre metadata
export interface GenreMetadataProps {
  name: string;
  slug: string;
  description?: string;
  mangaCount?: number;
}

// Search metadata
export interface SearchMetadataProps {
  query?: string;
  resultsCount?: number;
  filters?: {
    genres?: string[];
    status?: string;
    sortBy?: string;
  };
}

// JSON-LD Schema types
export interface BaseJsonLd {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface MangaJsonLd extends BaseJsonLd {
  '@type': 'Book';
  name: string;
  headline: string;
  description: string;
  image: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  genre: string;
  inLanguage: string;
  url: string;
}

export interface ChapterJsonLd extends BaseJsonLd {
  '@type': 'Chapter';
  isPartOf: {
    '@type': 'Book';
    name: string;
    url: string;
  };
  name: string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  url: string;
  pageStart: number;
  pageEnd: number;
}

export interface WebsiteJsonLd extends BaseJsonLd {
  '@type': 'WebSite';
  name: string;
  description: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface OrganizationJsonLd extends BaseJsonLd {
  '@type': 'Organization';
  name: string;
  legalName: string;
  url: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
  };
  foundingDate: string;
  founders: Array<{
    '@type': 'Person';
    name: string;
  }>;
  address: {
    '@type': 'PostalAddress';
    addressCountry: string;
  };
  contactPoint: {
    '@type': 'ContactPoint';
    contactType: string;
    availableLanguage: string[];
  };
}

// Utility function return types
export interface MetadataResult {
  metadata: Metadata;
  jsonLd?: string;
}

export interface SeoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Template types
export interface SeoTemplate {
  title: string;
  description: string;
  keywords: string[];
  type: 'website' | 'article' | 'book' | 'profile';
}

export interface SeoTemplates {
  default: SeoTemplate;
  manga: SeoTemplate;
  chapter: SeoTemplate;
  genre: SeoTemplate;
  search: SeoTemplate;
  profile: SeoTemplate;
}

// Configuration validation
export interface SeoConfigValidation {
  requiredFields: string[];
  optionalFields: string[];
  urlFields: string[];
  imageFields: string[];
}

// Export all types individually - no default export needed for types

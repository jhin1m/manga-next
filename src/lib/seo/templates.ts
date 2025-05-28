/**
 * SEO Templates for different page types
 */

import { seoConfig, getSiteUrl } from '@/config/seo.config';
import type { SeoTemplates, SeoTemplate } from './types';

// Base template that all others extend
const baseTemplate: SeoTemplate = {
  title: seoConfig.seo.defaultTitle,
  description: seoConfig.site.description,
  keywords: [...seoConfig.site.keywords],
  type: 'website',
};

// Page-specific templates
export const seoTemplates: SeoTemplates = {
  default: baseTemplate,

  manga: {
    title: '{title} - Read Online Free | {siteName}',
    description: 'Read {title} manga online for free. {description} Latest chapters available on {siteName}.',
    keywords: ['{title}', 'manga', 'read online', 'free manga', '{genres}', '{author}'],
    type: 'article',
  },

  chapter: {
    title: '{mangaTitle} Chapter {chapterNumber} - {siteName}',
    description: 'Read {mangaTitle} Chapter {chapterNumber} online for free. High quality manga pages on {siteName}.',
    keywords: ['{mangaTitle}', 'Chapter {chapterNumber}', 'manga', 'read online', '{genres}'],
    type: 'article',
  },

  genre: {
    title: '{genreName} Manga - Browse {genreName} Comics | {siteName}',
    description: 'Discover the best {genreName} manga series. Browse {mangaCount} {genreName} comics and read online for free on {siteName}.',
    keywords: ['{genreName} manga', '{genreName} comics', 'read {genreName}', 'manga genre'],
    type: 'website',
  },

  search: {
    title: 'Search Results for "{query}" | {siteName}',
    description: 'Find manga with keyword "{query}". Browse search results and discover new manga series on {siteName}.',
    keywords: ['search', 'find manga', '{query}', 'manga search'],
    type: 'website',
  },

  profile: {
    title: '{username} Profile | {siteName}',
    description: 'View {username}\'s profile, bookmarks, and reading history on {siteName}.',
    keywords: ['user profile', '{username}', 'bookmarks', 'reading history'],
    type: 'profile',
  },
};

// Template processing functions
export const processTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  let processed = template;

  // Add default variables
  const defaultVars = {
    siteName: seoConfig.site.name,
    siteDescription: seoConfig.site.description,
    siteUrl: seoConfig.urls.base,
  };

  const allVars = { ...defaultVars, ...variables };

  // Replace template variables
  Object.entries(allVars).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });

  // Clean up any remaining unreplaced variables
  processed = processed.replace(/{[^}]+}/g, '');

  // Clean up extra spaces and punctuation
  processed = processed.replace(/\s+/g, ' ').trim();
  processed = processed.replace(/\s*,\s*,/g, ',');
  processed = processed.replace(/,\s*$/, '');

  return processed;
};

export const processKeywords = (
  keywords: string[],
  variables: Record<string, any>
): string[] => {
  return keywords
    .map(keyword => processTemplate(keyword, variables))
    .filter(keyword => keyword.length > 0)
    .map(keyword => keyword.toLowerCase())
    .filter((keyword, index, array) => array.indexOf(keyword) === index); // Remove duplicates
};

// Specific template processors
export const getMangaTemplate = (variables: {
  title: string;
  description?: string;
  genres?: string[];
  author?: string;
}) => {
  const template = seoTemplates.manga;
  const genresString = variables.genres?.join(', ') || '';

  return {
    title: processTemplate(template.title, variables),
    description: processTemplate(template.description, {
      ...variables,
      description: variables.description || `${variables.title} manga series`,
    }),
    keywords: processKeywords(template.keywords, {
      ...variables,
      genres: genresString,
    }),
    type: template.type,
  };
};

export const getChapterTemplate = (variables: {
  mangaTitle: string;
  chapterNumber: number;
  chapterTitle?: string;
  genres?: string[];
}) => {
  const template = seoTemplates.chapter;
  const genresString = variables.genres?.join(', ') || '';

  return {
    title: processTemplate(template.title, variables),
    description: processTemplate(template.description, variables),
    keywords: processKeywords(template.keywords, {
      ...variables,
      genres: genresString,
    }),
    type: template.type,
  };
};

export const getGenreTemplate = (variables: {
  genreName: string;
  mangaCount?: number;
  description?: string;
}) => {
  const template = seoTemplates.genre;

  return {
    title: processTemplate(template.title, variables),
    description: processTemplate(template.description, {
      ...variables,
      mangaCount: variables.mangaCount || 'many',
    }),
    keywords: processKeywords(template.keywords, variables),
    type: template.type,
  };
};

export const getSearchTemplate = (variables: {
  query?: string;
  resultsCount?: number;
}) => {
  const template = seoTemplates.search;

  if (!variables.query) {
    return {
      title: `Search Manga | ${seoConfig.site.name}`,
      description: `Search for manga series on ${seoConfig.site.name}. Find your favorite manga and read online for free.`,
      keywords: ['search', 'find manga', 'manga search'],
      type: template.type,
    };
  }

  return {
    title: processTemplate(template.title, variables),
    description: processTemplate(template.description, variables),
    keywords: processKeywords(template.keywords, variables),
    type: template.type,
  };
};

export const getProfileTemplate = (variables: {
  username: string;
  displayName?: string;
}) => {
  const template = seoTemplates.profile;

  return {
    title: processTemplate(template.title, variables),
    description: processTemplate(template.description, variables),
    keywords: processKeywords(template.keywords, variables),
    type: template.type,
  };
};

// Validation helpers
export const validateTemplate = (template: SeoTemplate): boolean => {
  return !!(
    template.title &&
    template.description &&
    template.keywords &&
    template.keywords.length > 0 &&
    template.type
  );
};

export const validateAllTemplates = (): boolean => {
  return Object.values(seoTemplates).every(validateTemplate);
};

export default {
  seoTemplates,
  processTemplate,
  processKeywords,
  getMangaTemplate,
  getChapterTemplate,
  getGenreTemplate,
  getSearchTemplate,
  getProfileTemplate,
  validateTemplate,
  validateAllTemplates,
};

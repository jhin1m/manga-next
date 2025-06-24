/**
 * SEO Templates for different page types
 */

import { seoConfig } from '@/config/seo.config';
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
    title: '{title}',
    description:
      '{seoText.read} {title} {seoText.manga} {seoText.online} {seoText.forFree}. {description} {seoText.latestChapters} {seoText.on} {siteName}.',
    keywords: [
      '{title}',
      '{seoText.manga}',
      '{seoText.readOnline}',
      '{seoText.freeManga}',
      '{genres}',
      '{author}',
    ],
    type: 'article',
  },

  chapter: {
    title: '{mangaTitle} {seoText.chapter} {chapterNumber}',
    description:
      '{seoText.read} {mangaTitle} {seoText.chapter} {chapterNumber} {seoText.online} {seoText.forFree}. {seoText.highQualityPages} {seoText.on} {siteName}.',
    keywords: [
      '{mangaTitle}',
      '{seoText.chapter} {chapterNumber}',
      '{seoText.manga}',
      '{seoText.readOnline}',
      '{genres}',
    ],
    type: 'article',
  },

  genre: {
    title: '{genreName}',
    description:
      '{seoText.discoverBest} {genreName} {seoText.manga} {seoText.series}. {seoText.browse} {mangaCount} {genreName} {seoText.comics} {seoText.and} {seoText.readOnline} {seoText.forFree} {seoText.on} {siteName}.',
    keywords: [
      '{genreName} {seoText.manga}',
      '{genreName} {seoText.comics}',
      '{seoText.readOnline} {genreName}',
      '{seoText.mangaGenre}',
    ],
    type: 'website',
  },

  search: {
    title: '{seoText.searchResults} for "{query}" | {siteName}',
    description:
      '{seoText.findWithKeyword} "{query}". {seoText.browseSearchResults} {seoText.on} {siteName}.',
    keywords: ['{seoText.search}', '{seoText.findManga}', '{query}', '{seoText.mangaSearch}'],
    type: 'website',
  },

  mangaList: {
    title: '{pageTitle}',
    description:
      '{pageTitle} {siteName}. {seoText.discoverBest} {totalResults} {seoText.manga} {seoText.series} {seoText.and} {seoText.readOnline} {seoText.forFree}. {seoText.updatedDaily}.',
    keywords: [
      '{pageTitle}',
      '{seoText.mangaList}',
      '{seoText.browseManga}',
      '{seoText.readMangaOnline}',
      '{seoText.freeManga}',
      '{filters}',
    ],
    type: 'website',
  },

  profile: {
    title: '{username} {seoText.profile} | {siteName}',
    description:
      "{seoText.viewProfile} {username}'s {seoText.profile}, {seoText.bookmarks}, {seoText.and} {seoText.readingHistory} {seoText.on} {siteName}.",
    keywords: [
      '{seoText.userProfile}',
      '{username}',
      '{seoText.bookmarks}',
      '{seoText.readingHistory}',
    ],
    type: 'profile',
  },
};

// Template processing functions
export const processTemplate = (template: string, variables: Record<string, any>): string => {
  let processed = template;

  // Add default variables
  const defaultVars = {
    siteName: seoConfig.site.name,
    siteDescription: seoConfig.site.description,
    siteUrl: seoConfig.urls.base,
    seoText: seoConfig.seoText,
  };

  const allVars = { ...defaultVars, ...variables };

  // Replace template variables (including nested seoText properties)
  Object.entries(allVars).forEach(([key, value]) => {
    if (key === 'seoText' && typeof value === 'object') {
      // Handle nested seoText properties
      Object.entries(value).forEach(([textKey, textValue]) => {
        const regex = new RegExp(`{seoText\\.${textKey}}`, 'g');
        processed = processed.replace(regex, String(textValue || ''));
      });
    } else {
      const regex = new RegExp(`{${key}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    }
  });

  // Clean up any remaining unreplaced variables
  processed = processed.replace(/{[^}]+}/g, '');

  // Clean up extra spaces and punctuation
  processed = processed.replace(/\s+/g, ' ').trim();
  processed = processed.replace(/\s*,\s*,/g, ',');
  processed = processed.replace(/,\s*$/, '');

  return processed;
};

export const processKeywords = (keywords: string[], variables: Record<string, any>): string[] => {
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
      description:
        variables.description ||
        `${variables.title} ${seoConfig.seoText.manga} ${seoConfig.seoText.series}`,
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
      mangaCount: variables.mangaCount || seoConfig.seoText.many,
    }),
    keywords: processKeywords(template.keywords, variables),
    type: template.type,
  };
};

export const getSearchTemplate = (variables: { query?: string; resultsCount?: number }) => {
  const template = seoTemplates.search;

  if (!variables.query) {
    return {
      title: `${seoConfig.seoText.search} ${seoConfig.seoText.manga} | ${seoConfig.site.name}`,
      description: `${seoConfig.seoText.searchFor} ${seoConfig.seoText.manga} ${seoConfig.seoText.series} ${seoConfig.seoText.on} ${seoConfig.site.name}. ${seoConfig.seoText.findFavorite} ${seoConfig.seoText.manga} ${seoConfig.seoText.and} ${seoConfig.seoText.readOnline} ${seoConfig.seoText.forFree}.`,
      keywords: [
        seoConfig.seoText.search,
        seoConfig.seoText.findManga,
        seoConfig.seoText.mangaSearch,
      ],
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

export const getMangaListTemplate = (variables: {
  pageTitle: string;
  totalResults?: number;
  filters?: string[];
  sort?: string;
  status?: string;
  genre?: string;
}) => {
  const template = seoTemplates.mangaList;
  const filtersString = variables.filters?.join(', ') || '';

  return {
    title: processTemplate(template.title, variables),
    description: processTemplate(template.description, {
      ...variables,
    }),
    keywords: processKeywords(template.keywords, {
      ...variables,
      filters: filtersString,
    }),
    type: template.type,
  };
};

export const getProfileTemplate = (variables: { username: string; displayName?: string }) => {
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

const seoTemplatesUtils = {
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

export default seoTemplatesUtils;

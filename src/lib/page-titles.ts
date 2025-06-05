/**
 * Server-side page title utilities
 * These functions can be used in generateMetadata and other server-side contexts
 */

import { getPageTitle, getGenreTitle } from '@/config/page-titles.config';

/**
 * Server-side function to get page titles
 * Use this in generateMetadata functions
 */
export function getServerPageTitle(
  section: string,
  filters: {
    sort?: string;
    status?: string;
    genre?: string;
  } = {},
  locale: string = 'en'
) {
  return getPageTitle(section, filters, locale);
}

/**
 * Server-side function to get genre titles
 * Use this in generateMetadata functions
 */
export function getServerGenreTitle(genre: string, locale: string = 'en') {
  return getGenreTitle(genre, locale);
}

/**
 * Get manga page title with proper fallbacks
 */
export function getMangaPageTitle(
  filters: {
    sort?: string;
    status?: string;
    genre?: string;
  } = {},
  locale: string = 'en'
) {
  return getServerPageTitle('manga', filters, locale);
}

/**
 * Get localized page title for any section
 */
export function getLocalizedPageTitle(
  section: string,
  filters: Record<string, string | undefined> = {},
  locale: string = 'en'
) {
  return getPageTitle(section, filters, locale);
}

export default {
  getServerPageTitle,
  getServerGenreTitle,
  getMangaPageTitle,
  getLocalizedPageTitle,
};

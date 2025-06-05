'use client';

import { useLocale } from 'next-intl';
import { getPageTitle, getGenreTitle } from '@/config/page-titles.config';

/**
 * Hook to get localized page titles based on filters
 * Integrates with next-intl for proper localization
 */
export function usePageTitle() {
  const locale = useLocale();

  const getMangaPageTitle = (filters: {
    sort?: string;
    status?: string;
    genre?: string;
  } = {}) => {
    return getPageTitle('manga', filters, locale);
  };

  const getGenrePageTitle = (genre: string) => {
    return getGenreTitle(genre, locale);
  };

  return {
    getMangaPageTitle,
    getGenrePageTitle,
    locale,
  };
}

export default usePageTitle;

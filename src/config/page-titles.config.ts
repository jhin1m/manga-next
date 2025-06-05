/**
 * Page Titles Configuration with i18n support
 * Configurable page titles for different filters and languages
 */

// Type definitions
export interface PageTitleConfig {
  [key: string]: {
    default: string;
    sort: Record<string, string>;
    status: Record<string, string>;
    combined: Record<string, string>;
  };
}

export interface LocalizedPageTitles {
  [locale: string]: PageTitleConfig;
}

// Default English configuration
const englishTitles: PageTitleConfig = {
  manga: {
    default: 'Latest Manga',
    sort: {
      latest: 'Latest Manga',
      popular: 'Popular Manga',
      rating: 'Top Rated Manga',
      views: 'Most Viewed Manga',
      updated: 'Recently Updated Manga',
      alphabetical: 'Manga A-Z',
      trending: 'Trending Manga',
      new: 'New Manga',
    },
    status: {
      all: 'All Manga',
      ongoing: 'Ongoing Manga',
      completed: 'Completed Manga',
      hiatus: 'Manga on Hiatus',
      cancelled: 'Cancelled Manga',
      upcoming: 'Upcoming Manga',
    },
    combined: {
      'popular+completed': 'Popular Completed Manga',
      'rating+ongoing': 'Top Rated Ongoing Manga',
      'views+completed': 'Most Viewed Completed Manga',
      'trending+ongoing': 'Trending Ongoing Manga',
      'new+ongoing': 'New Ongoing Manga',
    },
  },
};

// Vietnamese configuration
const vietnameseTitles: PageTitleConfig = {
  manga: {
    default: 'Truyện Tranh Mới Nhất',
    sort: {
      latest: 'Truyện Tranh Mới Nhất',
      popular: 'Truyện Tranh Phổ Biến',
      rating: 'Truyện Tranh Đánh Giá Cao',
      views: 'Truyện Tranh Xem Nhiều',
      updated: 'Truyện Tranh Cập Nhật Gần Đây',
      alphabetical: 'Truyện Tranh A-Z',
      trending: 'Truyện Tranh Thịnh Hành',
      new: 'Truyện Tranh Mới',
    },
    status: {
      all: 'Danh Sách Truyện Tranh',
      ongoing: 'Truyện Tranh Đang Tiến Hành',
      completed: 'Truyện Tranh Đã Hoàn Thành',
      hiatus: 'Truyện Tranh Tạm Dừng',
      cancelled: 'Truyện Tranh Đã Hủy',
      upcoming: 'Truyện Tranh Sắp Ra',
    },
    combined: {
      'popular+completed': 'Truyện Tranh Hoàn Thành Phổ Biến',
      'rating+ongoing': 'Truyện Tranh Đang Tiến Hành Đánh Giá Cao',
      'views+completed': 'Truyện Tranh Hoàn Thành Xem Nhiều',
      'trending+ongoing': 'Truyện Tranh Đang Tiến Hành Thịnh Hành',
      'new+ongoing': 'Truyện Tranh Đang Tiến Hành Mới',
    },
  },
};

// Japanese configuration
const japaneseTitles: PageTitleConfig = {
  manga: {
    default: '最新マンガ',
    sort: {
      latest: '最新マンガ',
      popular: '人気マンガ',
      rating: '高評価マンガ',
      views: '閲覧数の多いマンガ',
      updated: '最近更新されたマンガ',
      alphabetical: 'マンガA-Z',
      trending: 'トレンドマンガ',
      new: '新作マンガ',
    },
    status: {
      all: 'すべてのマンガ',
      ongoing: '連載中マンガ',
      completed: '完結マンガ',
      hiatus: '休載中マンガ',
      cancelled: '打ち切りマンガ',
      upcoming: '近日公開マンガ',
    },
    combined: {
      'popular+completed': '人気完結マンガ',
      'rating+ongoing': '高評価連載中マンガ',
      'views+completed': '閲覧数の多い完結マンガ',
      'trending+ongoing': 'トレンド連載中マンガ',
      'new+ongoing': '新作連載中マンガ',
    },
  },
};

// Combined localized configuration
export const localizedPageTitles: LocalizedPageTitles = {
  en: englishTitles,
  'en-US': englishTitles,
  vi: vietnameseTitles,
  'vi-VN': vietnameseTitles,
  ja: japaneseTitles,
  'ja-JP': japaneseTitles,
};

// Environment variable overrides
const getEnvironmentPageTitles = () => {
  const overrides: Partial<PageTitleConfig> = {};
  
  // Allow environment variable overrides for specific titles
  const envPrefix = 'NEXT_PUBLIC_PAGE_TITLE_';
  
  Object.keys(process.env).forEach(key => {
    if (key.startsWith(envPrefix)) {
      const titleKey = key.replace(envPrefix, '').toLowerCase();
      const value = process.env[key];
      
      if (value) {
        // Parse the key to determine the structure
        // Example: NEXT_PUBLIC_PAGE_TITLE_MANGA_SORT_POPULAR="Custom Popular Manga"
        const parts = titleKey.split('_');
        if (parts.length >= 3) {
          const [section, type, filter] = parts;
          if (!overrides[section]) {
            overrides[section] = { default: '', sort: {}, status: {}, combined: {} };
          }
          if (type === 'sort' || type === 'status' || type === 'combined') {
            (overrides[section] as any)[type][filter] = value;
          } else if (type === 'default') {
            overrides[section]!.default = value;
          }
        }
      }
    }
  });
  
  return overrides;
};

// Get page title based on filters and locale
export function getPageTitle(
  section: string,
  filters: {
    sort?: string;
    status?: string;
    genre?: string;
  } = {},
  locale: string = 'en'
): string {
  // Get base configuration for locale
  const baseConfig = localizedPageTitles[locale] || localizedPageTitles['en'];
  const sectionConfig = baseConfig[section];
  
  if (!sectionConfig) {
    return baseConfig.manga?.default || 'Latest Manga';
  }
  
  // Apply environment overrides
  const envOverrides = getEnvironmentPageTitles();
  const finalConfig = {
    ...sectionConfig,
    ...envOverrides[section],
    sort: { ...sectionConfig.sort, ...envOverrides[section]?.sort },
    status: { ...sectionConfig.status, ...envOverrides[section]?.status },
    combined: { ...sectionConfig.combined, ...envOverrides[section]?.combined },
  };
  
  // Handle genre-specific titles
  if (filters.genre) {
    const genreTitle = getGenreTitle(filters.genre, locale);
    return genreTitle;
  }
  
  // Handle combined filters
  if (filters.sort && filters.status) {
    const combinedKey = `${filters.sort}+${filters.status}`;
    if (finalConfig.combined[combinedKey]) {
      return finalConfig.combined[combinedKey];
    }
  }
  
  // Handle status filter
  if (filters.status && finalConfig.status[filters.status]) {
    return finalConfig.status[filters.status];
  }
  
  // Handle sort filter
  if (filters.sort && finalConfig.sort[filters.sort]) {
    return finalConfig.sort[filters.sort];
  }
  
  // Return default
  return finalConfig.default;
}

// Get genre title with proper capitalization and localization
export function getGenreTitle(genre: string, locale: string = 'en'): string {
  // Genre translations
  const genreTranslations: Record<string, Record<string, string>> = {
    en: {
      action: 'Action Manga',
      adventure: 'Adventure Manga',
      comedy: 'Comedy Manga',
      drama: 'Drama Manga',
      fantasy: 'Fantasy Manga',
      horror: 'Horror Manga',
      romance: 'Romance Manga',
      'sci-fi': 'Sci-Fi Manga',
      slice_of_life: 'Slice of Life Manga',
      sports: 'Sports Manga',
      supernatural: 'Supernatural Manga',
      thriller: 'Thriller Manga',
    },
    vi: {
      action: 'Truyện Tranh Hành Động',
      adventure: 'Truyện Tranh Phiêu Lưu',
      comedy: 'Truyện Tranh Hài Hước',
      drama: 'Truyện Tranh Chính Kịch',
      fantasy: 'Truyện Tranh Giả Tưởng',
      horror: 'Truyện Tranh Kinh Dị',
      romance: 'Truyện Tranh Lãng Mạn',
      'sci-fi': 'Truyện Tranh Khoa Học Viễn Tưởng',
      slice_of_life: 'Truyện Tranh Đời Thường',
      sports: 'Truyện Tranh Thể Thao',
      supernatural: 'Truyện Tranh Siêu Nhiên',
      thriller: 'Truyện Tranh Ly Kỳ',
    },
    ja: {
      action: 'アクションマンガ',
      adventure: 'アドベンチャーマンガ',
      comedy: 'コメディマンガ',
      drama: 'ドラママンガ',
      fantasy: 'ファンタジーマンガ',
      horror: 'ホラーマンガ',
      romance: 'ロマンスマンガ',
      'sci-fi': 'SFマンガ',
      slice_of_life: '日常系マンガ',
      sports: 'スポーツマンガ',
      supernatural: '超自然マンガ',
      thriller: 'スリラーマンガ',
    },
  };
  
  const translations = genreTranslations[locale] || genreTranslations['en'];
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, '_');
  
  return translations[normalizedGenre] || 
         `${genre.charAt(0).toUpperCase() + genre.slice(1)} Manga`;
}

// Validation function
export function validatePageTitleConfig(config: PageTitleConfig): boolean {
  return Object.values(config).every(section => 
    section.default && 
    typeof section.sort === 'object' &&
    typeof section.status === 'object' &&
    typeof section.combined === 'object'
  );
}

export default {
  localizedPageTitles,
  getPageTitle,
  getGenreTitle,
  validatePageTitleConfig,
};

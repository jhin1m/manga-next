/**
 * Centralized SEO Configuration
 * This file can be gitignored for sensitive production values
 */

// Default configuration that works for all environments
const defaultSeoConfig = {
  site: {
    name: 'TruyentranhNuru',
    tagline: 'Thế Giới Truyện Tranh Hentai và Manga 18+ Chất Lượng Cao',
    description: 'Đọc Truyện Tranh Hentai và Manga 18+ Online Miễn Phí - Nội Dung Người Lớn',
    keywords: ['hentai', 'truyện hentai', 'truyện tranh 18+', 'truyện tranh người lớn', 'manga 18+', 'adult manga', 'doujinshi', 'TruyentranhNuru'],
    language: 'vi',
    locale: 'vi_VN',
  },
  
  urls: {
    base: 'http://localhost:3000', // Fallback for development
    logo: '/logo.png',
    favicon: '/favicon.ico',
    ogImage: '/images/og-image.jpg',
  },
  
  social: {
    twitter: {
      card: 'summary_large_image' as const,
      site: '@TruyentranhNuru',
      creator: '@TruyentranhNuru',
    },
    openGraph: {
      type: 'website' as const,
      siteName: 'TruyentranhNuru',
      locale: 'vi_VN',
    },
  },
  
  seo: {
    titleTemplate: '%s',
    defaultTitle: 'TruyentranhNuru - Đọc Truyện Tranh Hentai và Manga 18+ Online Miễn Phí',
    titleSeparator: ' | ',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  },
  
  schema: {
    organization: {
      name: 'TruyentranhNuru',
      legalName: 'TruyentranhNuru',
      foundingDate: '2024',
      founders: [
        {
          '@type': 'Person',
          name: 'TruyentranhNuru Team',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'VN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: ['Vietnamese', 'English'],
      },
    },
    website: {
      inLanguage: 'vi',
      isAccessibleForFree: true,
      isFamilyFriendly: false,
      audience: {
        '@type': 'Audience',
        audienceType: 'adult manga readers',
      },
    },
  },

  // Analytics and tracking configuration
  analytics: {
    googleAnalytics: {
      id: '', // Will be overridden by environment variable
      enabled: false,
    },
    googleTagManager: {
      id: '', // Will be overridden by environment variable
      enabled: false,
    },
    googleSiteVerification: '', // Will be overridden by environment variable
    facebookPixel: {
      id: '', // Will be overridden by environment variable
      enabled: false,
    },
    tracking: {
      enablePageViews: true,
      enableEvents: true,
      enableConversions: false,
    },
  },

  // Page titles configuration for different filters
  pageTitles: {
    manga: {
      default: 'Truyện Tranh Hentai Mới Nhất',
      sort: {
        latest: 'Truyện Tranh Hentai Mới Nhất',
        popular: 'Truyện Tranh Hentai Phổ Biến',
        rating: 'Truyện Tranh Hentai Đánh Giá Cao',
        views: 'Truyện Tranh Hentai Xem Nhiều Nhất',
        updated: 'Truyện Tranh Hentai Cập Nhật Gần Đây',
        alphabetical: 'Truyện Tranh Hentai A-Z',
      },
      status: {
        all: 'Tất Cả Truyện Tranh Hentai',
        ongoing: 'Truyện Tranh Hentai Đang Tiến Hành',
        completed: 'Truyện Tranh Hentai Hoàn Thành',
        hiatus: 'Truyện Tranh Hentai Tạm Ngưng',
        cancelled: 'Truyện Tranh Hentai Đã Hủy',
      },
      combined: {
        'popular+completed': 'Truyện Tranh Hentai Hoàn Thành Phổ Biến',
        'rating+ongoing': 'Truyện Tranh Hentai Đang Tiến Hành Đánh Giá Cao',
        'views+completed': 'Truyện Tranh Hentai Hoàn Thành Xem Nhiều Nhất',
      },
    },
  },

  // SEO Templates Text Configuration
  seoText: {
    // Common action words
    read: 'Đọc',
    online: 'trực tuyến',
    forFree: 'miễn phí',
    manga: 'truyện tranh hentai',
    chapter: 'Chương',
    comics: 'truyện tranh 18+',
    series: 'bộ truyện',

    // Template phrases
    latestChapters: 'Chương mới nhất có sẵn',
    highQualityPages: 'Trang truyện tranh chất lượng cao',
    discoverBest: 'Khám phá những bộ truyện hay nhất',
    browse: 'Duyệt',
    findWithKeyword: 'Tìm truyện tranh hentai với từ khóa',
    browseSearchResults: 'Duyệt kết quả tìm kiếm và khám phá bộ truyện mới',
    updatedDaily: 'Cập nhật hàng ngày với chương mới nhất',
    viewProfile: 'Xem',
    profile: 'hồ sơ',
    bookmarks: 'dấu trang',
    readingHistory: 'lịch sử đọc',

    // Search related text
    search: 'Tìm kiếm',
    searchResults: 'Kết quả tìm kiếm',
    findManga: 'tìm truyện tranh hentai',
    mangaSearch: 'tìm kiếm truyện tranh 18+',
    userProfile: 'hồ sơ người dùng',
    searchFor: 'Tìm kiếm',
    findFavorite: 'Tìm bộ truyện yêu thích của bạn',

    // List and genre text
    mangaList: 'danh sách truyện tranh hentai',
    browseManga: 'duyệt truyện tranh 18+',
    readMangaOnline: 'đọc truyện tranh hentai trực tuyến',
    freeManga: 'truyện tranh 18+ miễn phí',
    mangaGenre: 'thể loại truyện tranh hentai',
    readOnline: 'đọc trực tuyến',
    and: 'và',
    on: 'trên',
    many: 'nhiều',
  },
} as const;

// Environment-based overrides
const getEnvironmentConfig = () => {
  // Base URL configuration
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                  process.env.NEXT_PUBLIC_API_URL ||
                  defaultSeoConfig.urls.base;

  // Site basic information
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || defaultSeoConfig.site.name;
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || defaultSeoConfig.site.description;
  const siteTagline = process.env.NEXT_PUBLIC_SITE_TAGLINE || defaultSeoConfig.site.tagline;
  const siteLanguage = process.env.NEXT_PUBLIC_SITE_LANGUAGE || defaultSeoConfig.site.language;
  const siteLocale = process.env.NEXT_PUBLIC_SITE_LOCALE || defaultSeoConfig.site.locale;

  // Keywords configuration
  const siteKeywords = process.env.NEXT_PUBLIC_SITE_KEYWORDS
    ? process.env.NEXT_PUBLIC_SITE_KEYWORDS.split(',').map(k => k.trim())
    : defaultSeoConfig.site.keywords;

  // Assets configuration
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || defaultSeoConfig.urls.logo;
  const faviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL || defaultSeoConfig.urls.favicon;
  const ogImageUrl = process.env.NEXT_PUBLIC_OG_IMAGE || defaultSeoConfig.urls.ogImage;

  // Social media configuration
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || defaultSeoConfig.social.twitter.site;
  const twitterCreator = process.env.NEXT_PUBLIC_TWITTER_CREATOR || defaultSeoConfig.social.twitter.creator;
  const twitterCard = process.env.NEXT_PUBLIC_TWITTER_CARD || defaultSeoConfig.social.twitter.card;
  const ogType = process.env.NEXT_PUBLIC_OG_TYPE || defaultSeoConfig.social.openGraph.type;

  // SEO templates configuration
  const titleTemplate = process.env.NEXT_PUBLIC_TITLE_TEMPLATE || defaultSeoConfig.seo.titleTemplate;
  const defaultTitle = process.env.NEXT_PUBLIC_DEFAULT_TITLE || defaultSeoConfig.seo.defaultTitle;
  const titleSeparator = process.env.NEXT_PUBLIC_TITLE_SEPARATOR || defaultSeoConfig.seo.titleSeparator;

  // Robots configuration
  const robotsIndex = process.env.NEXT_PUBLIC_ROBOTS_INDEX !== 'false';
  const robotsFollow = process.env.NEXT_PUBLIC_ROBOTS_FOLLOW !== 'false';

  // Organization schema configuration
  const orgName = process.env.NEXT_PUBLIC_ORG_NAME || defaultSeoConfig.schema.organization.name;
  const orgLegalName = process.env.NEXT_PUBLIC_ORG_LEGAL_NAME || defaultSeoConfig.schema.organization.legalName;
  const orgFoundingDate = process.env.NEXT_PUBLIC_ORG_FOUNDING_DATE || defaultSeoConfig.schema.organization.foundingDate;
  const orgCountry = process.env.NEXT_PUBLIC_ORG_COUNTRY || defaultSeoConfig.schema.organization.address.addressCountry;

  // Analytics configuration
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '';
  const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || '';
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

  // SEO Text configuration from environment variables
  const seoText = {
    // Common action words
    read: process.env.NEXT_PUBLIC_SEO_TEXT_READ || defaultSeoConfig.seoText.read,
    online: process.env.NEXT_PUBLIC_SEO_TEXT_ONLINE || defaultSeoConfig.seoText.online,
    forFree: process.env.NEXT_PUBLIC_SEO_TEXT_FOR_FREE || defaultSeoConfig.seoText.forFree,
    manga: process.env.NEXT_PUBLIC_SEO_TEXT_MANGA || defaultSeoConfig.seoText.manga,
    chapter: process.env.NEXT_PUBLIC_SEO_TEXT_CHAPTER || defaultSeoConfig.seoText.chapter,
    comics: process.env.NEXT_PUBLIC_SEO_TEXT_COMICS || defaultSeoConfig.seoText.comics,
    series: process.env.NEXT_PUBLIC_SEO_TEXT_SERIES || defaultSeoConfig.seoText.series,

    // Template phrases
    latestChapters: process.env.NEXT_PUBLIC_SEO_TEXT_LATEST_CHAPTERS || defaultSeoConfig.seoText.latestChapters,
    highQualityPages: process.env.NEXT_PUBLIC_SEO_TEXT_HIGH_QUALITY_PAGES || defaultSeoConfig.seoText.highQualityPages,
    discoverBest: process.env.NEXT_PUBLIC_SEO_TEXT_DISCOVER_BEST || defaultSeoConfig.seoText.discoverBest,
    browse: process.env.NEXT_PUBLIC_SEO_TEXT_BROWSE || defaultSeoConfig.seoText.browse,
    findWithKeyword: process.env.NEXT_PUBLIC_SEO_TEXT_FIND_WITH_KEYWORD || defaultSeoConfig.seoText.findWithKeyword,
    browseSearchResults: process.env.NEXT_PUBLIC_SEO_TEXT_BROWSE_SEARCH_RESULTS || defaultSeoConfig.seoText.browseSearchResults,
    updatedDaily: process.env.NEXT_PUBLIC_SEO_TEXT_UPDATED_DAILY || defaultSeoConfig.seoText.updatedDaily,
    viewProfile: process.env.NEXT_PUBLIC_SEO_TEXT_VIEW_PROFILE || defaultSeoConfig.seoText.viewProfile,
    profile: process.env.NEXT_PUBLIC_SEO_TEXT_PROFILE || defaultSeoConfig.seoText.profile,
    bookmarks: process.env.NEXT_PUBLIC_SEO_TEXT_BOOKMARKS || defaultSeoConfig.seoText.bookmarks,
    readingHistory: process.env.NEXT_PUBLIC_SEO_TEXT_READING_HISTORY || defaultSeoConfig.seoText.readingHistory,

    // Search related text
    search: process.env.NEXT_PUBLIC_SEO_TEXT_SEARCH || defaultSeoConfig.seoText.search,
    searchResults: process.env.NEXT_PUBLIC_SEO_TEXT_SEARCH_RESULTS || defaultSeoConfig.seoText.searchResults,
    findManga: process.env.NEXT_PUBLIC_SEO_TEXT_FIND_MANGA || defaultSeoConfig.seoText.findManga,
    mangaSearch: process.env.NEXT_PUBLIC_SEO_TEXT_MANGA_SEARCH || defaultSeoConfig.seoText.mangaSearch,
    userProfile: process.env.NEXT_PUBLIC_SEO_TEXT_USER_PROFILE || defaultSeoConfig.seoText.userProfile,
    searchFor: process.env.NEXT_PUBLIC_SEO_TEXT_SEARCH_FOR || defaultSeoConfig.seoText.searchFor,
    findFavorite: process.env.NEXT_PUBLIC_SEO_TEXT_FIND_FAVORITE || defaultSeoConfig.seoText.findFavorite,

    // List and genre text
    mangaList: process.env.NEXT_PUBLIC_SEO_TEXT_MANGA_LIST || defaultSeoConfig.seoText.mangaList,
    browseManga: process.env.NEXT_PUBLIC_SEO_TEXT_BROWSE_MANGA || defaultSeoConfig.seoText.browseManga,
    readMangaOnline: process.env.NEXT_PUBLIC_SEO_TEXT_READ_MANGA_ONLINE || defaultSeoConfig.seoText.readMangaOnline,
    freeManga: process.env.NEXT_PUBLIC_SEO_TEXT_FREE_MANGA || defaultSeoConfig.seoText.freeManga,
    mangaGenre: process.env.NEXT_PUBLIC_SEO_TEXT_MANGA_GENRE || defaultSeoConfig.seoText.mangaGenre,
    readOnline: process.env.NEXT_PUBLIC_SEO_TEXT_READ_ONLINE || defaultSeoConfig.seoText.readOnline,
    and: process.env.NEXT_PUBLIC_SEO_TEXT_AND || defaultSeoConfig.seoText.and,
    on: process.env.NEXT_PUBLIC_SEO_TEXT_ON || defaultSeoConfig.seoText.on,
    many: process.env.NEXT_PUBLIC_SEO_TEXT_MANY || defaultSeoConfig.seoText.many,
  };

  return {
    urls: {
      ...defaultSeoConfig.urls,
      base: baseUrl,
      logo: logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`,
      favicon: faviconUrl.startsWith('http') ? faviconUrl : `${baseUrl}${faviconUrl}`,
      ogImage: ogImageUrl.startsWith('http') ? ogImageUrl : `${baseUrl}${ogImageUrl}`,
    },
    site: {
      ...defaultSeoConfig.site,
      name: siteName,
      tagline: siteTagline,
      description: siteDescription,
      keywords: siteKeywords,
      language: siteLanguage,
      locale: siteLocale,
    },
    social: {
      ...defaultSeoConfig.social,
      twitter: {
        ...defaultSeoConfig.social.twitter,
        card: twitterCard as 'summary_large_image',
        site: twitterHandle,
        creator: twitterCreator,
      },
      openGraph: {
        ...defaultSeoConfig.social.openGraph,
        type: ogType as 'website',
        siteName,
        locale: siteLocale,
      },
    },
    seo: {
      ...defaultSeoConfig.seo,
      titleTemplate,
      defaultTitle,
      titleSeparator,
      robots: {
        ...defaultSeoConfig.seo.robots,
        index: robotsIndex,
        follow: robotsFollow,
        googleBot: {
          ...defaultSeoConfig.seo.robots.googleBot,
          index: robotsIndex,
          follow: robotsFollow,
        },
      },
    },
    schema: {
      ...defaultSeoConfig.schema,
      organization: {
        ...defaultSeoConfig.schema.organization,
        name: orgName,
        legalName: orgLegalName,
        foundingDate: orgFoundingDate,
        address: {
          ...defaultSeoConfig.schema.organization.address,
          addressCountry: orgCountry,
        },
      },
    },
    analytics: {
      ...defaultSeoConfig.analytics,
      googleAnalytics: {
        id: googleAnalyticsId,
        enabled: !!googleAnalyticsId,
      },
      googleTagManager: {
        id: googleTagManagerId,
        enabled: !!googleTagManagerId,
      },
      googleSiteVerification,
      facebookPixel: {
        id: facebookPixelId,
        enabled: !!facebookPixelId,
      },
    },
    seoText,
  };
};

// Final merged configuration
export const seoConfig = {
  ...defaultSeoConfig,
  ...getEnvironmentConfig(),
} as const;

// Type exports for better TypeScript support
export type SeoConfig = typeof seoConfig;
export type SiteConfig = typeof seoConfig.site;
export type UrlConfig = typeof seoConfig.urls;
export type SocialConfig = typeof seoConfig.social;
export type SchemaConfig = typeof seoConfig.schema;
export type AnalyticsConfig = typeof seoConfig.analytics;
export type SeoTextConfig = typeof seoConfig.seoText;

// Validation function
export const validateSeoConfig = (): boolean => {
  const required = [
    seoConfig.site.name,
    seoConfig.site.description,
    seoConfig.urls.base,
  ];
  
  return required.every(field => field && field.length > 0);
};

// Helper functions
export const getSiteUrl = (path: string = ''): string => {
  const baseUrl = seoConfig.urls.base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getPageTitle = (title?: string): string => {
  if (!title) return seoConfig.seo.defaultTitle;
  return seoConfig.seo.titleTemplate.replace('%s', title);
};

// Analytics helper functions
export const getGoogleAnalyticsId = (): string | null => {
  return seoConfig.analytics.googleAnalytics.enabled
    ? seoConfig.analytics.googleAnalytics.id
    : null;
};

export const getGoogleTagManagerId = (): string | null => {
  return seoConfig.analytics.googleTagManager.enabled
    ? seoConfig.analytics.googleTagManager.id
    : null;
};

export const getFacebookPixelId = (): string | null => {
  return seoConfig.analytics.facebookPixel.enabled
    ? seoConfig.analytics.facebookPixel.id
    : null;
};

export const getGoogleSiteVerification = (): string | null => {
  return seoConfig.analytics.googleSiteVerification || null;
};

// SEO validation with analytics
export const validateSeoConfigExtended = (): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} => {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!seoConfig.site.name) missing.push('site.name');
  if (!seoConfig.site.description) missing.push('site.description');
  if (!seoConfig.urls.base) missing.push('urls.base');

  // Analytics warnings
  if (!seoConfig.analytics.googleAnalytics.enabled) {
    warnings.push('Google Analytics not configured');
  }
  if (!seoConfig.analytics.googleSiteVerification) {
    warnings.push('Google Site Verification not configured');
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
};

// Environment detection helper
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export default seoConfig;

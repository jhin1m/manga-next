/**
 * Static Site Constants
 * These values don't change between environments
 */

export const SITE_CONSTANTS = {
  // Navigation
  navigation: {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Manga', href: '/manga' },
      { name: 'Search', href: '/search' },
      { name: 'Rankings', href: '/rankings' },
    ],
    footer: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Image dimensions
  images: {
    manga: {
      cover: { width: 300, height: 400 },
      thumbnail: { width: 150, height: 200 },
      banner: { width: 1200, height: 400 },
    },
    chapter: {
      page: { maxWidth: 1200, maxHeight: 1800 },
      thumbnail: { width: 200, height: 300 },
    },
    avatar: {
      small: { width: 32, height: 32 },
      medium: { width: 64, height: 64 },
      large: { width: 128, height: 128 },
      maxSize: 5 * 1024 * 1024, // 5MB
    },
    og: {
      default: { width: 1200, height: 630 },
      twitter: { width: 1200, height: 600 },
    },
  },

  // Content limits
  limits: {
    title: { min: 1, max: 200 },
    description: { min: 10, max: 500 },
    comment: { min: 1, max: 1000 },
    search: { min: 1, max: 100 },
  },

  // File types
  allowedFileTypes: {
    images: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    documents: ['pdf'],
  },

  // Cache durations (in seconds)
  cache: {
    static: 31536000, // 1 year
    dynamic: 3600, // 1 hour
    api: 300, // 5 minutes
    search: 60, // 1 minute
  },

  // External links
  external: {
    github: 'https://github.com/your-repo',
    discord: 'https://discord.gg/your-server',
    twitter: 'https://twitter.com/your-account',
  },

  // Feature flags
  features: {
    comments: true,
    bookmarks: true,
    ratings: true,
    search: true,
    darkMode: true,
    i18n: false, // Set to true when implementing internationalization
  },

  // API endpoints
  api: {
    manga: '/api/manga',
    chapters: '/api/chapters',
    search: '/api/search',
    auth: '/api/auth',
    comments: '/api/comments',
    bookmarks: '/api/bookmarks',
  },
} as const;

// Type exports
export type SiteConstants = typeof SITE_CONSTANTS;
export type NavigationItem = typeof SITE_CONSTANTS.navigation.main[0];
export type ImageDimensions = typeof SITE_CONSTANTS.images.manga.cover;
export type CacheDuration = keyof typeof SITE_CONSTANTS.cache;

export default SITE_CONSTANTS;

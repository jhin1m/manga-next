export const locales = ['en', 'vi'] as const;
export const defaultLocale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'en' | 'vi') || 'en';
export type Locale = (typeof locales)[number];

export const localeNames = {
  en: 'English',
  vi: 'Tiếng Việt',
} as const;

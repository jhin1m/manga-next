'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  formatViewsI18n,
  formatDateI18n,
  formatNumberWithLocale,
  formatDateWithLocale,
  formatCurrencyWithLocale,
  formatPercentageWithLocale,
} from '@/lib/utils/format-i18n';

/**
 * Hook để sử dụng format functions với i18n
 * Tự động lấy translations và locale hiện tại
 */
export function useFormat() {
  const locale = useLocale();
  const tNumbers = useTranslations('format.numbers');
  const tTimeAgo = useTranslations('format.timeAgo');
  const tMonths = useTranslations('format.months');

  // Mapping locale to Intl locale
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  return {
    /**
     * Định dạng số lượt xem (ví dụ: 1200 -> 1.2K hoặc 1.2Tr)
     */
    formatViews: (count: number) => formatViewsI18n(count, tNumbers),

    /**
     * Định dạng ngày thành dạng "time ago" (ví dụ: "2 hours ago" hoặc "2 giờ trước")
     */
    formatDate: (dateString: string) => formatDateI18n(dateString, tTimeAgo, tMonths),

    /**
     * Định dạng số với locale hiện tại
     */
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) =>
      formatNumberWithLocale(number, intlLocale, options),

    /**
     * Định dạng ngày với locale hiện tại
     */
    formatDateLocale: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDateWithLocale(date, intlLocale, options),

    /**
     * Định dạng tiền tệ với locale hiện tại
     */
    formatCurrency: (amount: number, currency: string = 'USD') =>
      formatCurrencyWithLocale(amount, currency, intlLocale),

    /**
     * Định dạng phần trăm với locale hiện tại
     */
    formatPercentage: (value: number, options?: Intl.NumberFormatOptions) =>
      formatPercentageWithLocale(value, intlLocale, options),

    /**
     * Locale hiện tại
     */
    locale,

    /**
     * Intl locale string
     */
    intlLocale,
  };
}

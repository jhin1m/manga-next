/**
 * Các hàm tiện ích để định dạng dữ liệu với hỗ trợ đa ngôn ngữ
 */

/**
 * Định dạng số lượt xem với hỗ trợ đa ngôn ngữ (ví dụ: 1200 -> 1.2K hoặc 1.2Tr)
 * @param count Số lượt xem
 * @param t Translation function từ useTranslations('format.numbers')
 * @returns Chuỗi đã định dạng
 */
export function formatViewsI18n(count: number, t: any): string {
  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1) + t('billion');
  } else if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + t('million');
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + t('thousand');
  }
  return count.toString();
}

/**
 * Định dạng ngày thành dạng "time ago" với hỗ trợ đa ngôn ngữ
 * @param dateString Chuỗi ngày
 * @param tTimeAgo Translation function từ useTranslations('format.timeAgo')
 * @param tMonths Translation function từ useTranslations('format.months')
 * @returns Chuỗi thời gian đã định dạng
 */
export function formatDateI18n(dateString: string, tTimeAgo: any, tMonths: any): string {
  // Validate input
  if (!dateString || dateString === 'undefined' || dateString === 'null') {
    return '';
  }

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return tTimeAgo('minutesAgo', { minutes: diffMinutes });
    }
    return tTimeAgo('hoursAgo', { hours: diffHours });
  } else if (diffDays === 1) {
    return tTimeAgo('yesterday');
  } else if (diffDays < 7) {
    return tTimeAgo('daysAgo', { days: diffDays });
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return diffWeeks === 1
      ? tTimeAgo('weekAgo')
      : tTimeAgo('weeksAgo', { weeks: diffWeeks });
  } else if (diffDays < 365) {
    // Hiển thị ngày và tháng - truy cập từng tháng riêng lẻ
    const monthIndex = date.getMonth();
    // Validate month index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return '';
    }
    const monthName = tMonths(`short.${monthIndex}`);
    return `${date.getDate()} ${monthName}`;
  } else {
    // Hiển thị ngày, tháng và năm cho thời gian quá lâu
    const monthIndex = date.getMonth();
    // Validate month index
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return '';
    }
    const monthName = tMonths(`short.${monthIndex}`);
    return `${date.getDate()} ${monthName} ${date.getFullYear()}`;
  }
}

/**
 * Hook để sử dụng format functions với i18n
 * Sử dụng trong React components
 */
export function useFormatI18n() {
  // Import useTranslations trong component sử dụng hook này
  // const tNumbers = useTranslations('format.numbers');
  // const tTimeAgo = useTranslations('format.timeAgo');
  // const tMonths = useTranslations('format.months');

  return {
    formatViews: (count: number, tNumbers: any) => formatViewsI18n(count, tNumbers),
    formatDate: (dateString: string, tTimeAgo: any, tMonths: any) => formatDateI18n(dateString, tTimeAgo, tMonths)
  };
}

/**
 * Định dạng số với locale (sử dụng Intl.NumberFormat)
 * @param number Số cần định dạng
 * @param locale Locale (ví dụ: 'en-US', 'vi-VN')
 * @param options Tùy chọn định dạng
 * @returns Chuỗi số đã định dạng
 */
export function formatNumberWithLocale(
  number: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(number);
}

/**
 * Định dạng ngày với locale (sử dụng Intl.DateTimeFormat)
 * @param date Ngày cần định dạng
 * @param locale Locale (ví dụ: 'en-US', 'vi-VN')
 * @param options Tùy chọn định dạng
 * @returns Chuỗi ngày đã định dạng
 */
export function formatDateWithLocale(
  date: Date | string,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Định dạng tiền tệ với locale
 * @param amount Số tiền
 * @param currency Mã tiền tệ (ví dụ: 'USD', 'VND')
 * @param locale Locale
 * @returns Chuỗi tiền tệ đã định dạng
 */
export function formatCurrencyWithLocale(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Định dạng phần trăm với locale
 * @param value Giá trị (0.1 = 10%)
 * @param locale Locale
 * @param options Tùy chọn định dạng
 * @returns Chuỗi phần trăm đã định dạng
 */
export function formatPercentageWithLocale(
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    ...options
  }).format(value);
}

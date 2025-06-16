/**
 * Các hàm tiện ích để định dạng dữ liệu
 *
 * NOTE: Đây là phiên bản legacy. Để sử dụng i18n, hãy dùng:
 * - import { useFormat } from '@/hooks/useFormat' (trong React components)
 * - import { formatViewsI18n, formatDateI18n } from '@/lib/utils/format-i18n' (trong utility functions)
 */

/**
 * Định dạng số lượt xem (ví dụ: 1200 -> 1.2K)
 * @param count Số lượt xem
 * @returns Chuỗi đã định dạng
 */
export function formatViews(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
}

/**
 * Định dạng ngày thành dạng "time ago"
 * @param dateString Chuỗi ngày
 * @returns Chuỗi thời gian đã định dạng
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    // Hiển thị ngày và tháng
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  } else {
    // Hiển thị ngày, tháng và năm cho thời gian quá lâu
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }
}

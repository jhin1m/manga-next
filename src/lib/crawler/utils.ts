/**
 * Các hàm tiện ích cho crawler
 */

/**
 * Chuyển đổi chuỗi thành slug
 * @param text Chuỗi cần chuyển đổi
 * @returns Slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Tạm dừng thực thi trong một khoảng thời gian
 * @param ms Thời gian tạm dừng (milliseconds)
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chuyển đổi status code sang chuỗi
 * @param statusCode Mã trạng thái
 * @returns Chuỗi trạng thái
 */
export function parseStatus(statusCode: number): string {
  const statusMap: Record<number, string> = {
    0: 'draft',
    1: 'ongoing',
    2: 'completed',
    3: 'cancelled',
    4: 'hiatus'
  };
  
  return statusMap[statusCode] || 'ongoing';
}

/**
 * Định dạng số chapter
 * @param order Số thứ tự chapter
 * @returns Chuỗi số chapter đã định dạng
 */
export function formatChapterNumber(order: number): string {
  return order.toString();
}

/**
 * Tạo tên file duy nhất từ URL
 * @param url URL gốc
 * @returns Tên file duy nhất
 */
export function generateFilename(url: string, prefix: string = ''): string {
  // Lấy phần cuối của URL
  const urlParts = new URL(url).pathname.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  // Thêm prefix nếu có
  return prefix ? `${prefix}-${filename}` : filename;
}

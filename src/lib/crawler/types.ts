/**
 * Định nghĩa các kiểu dữ liệu chung cho crawler
 */

// Cấu hình cho nguồn
export interface SourceConfig {
  baseUrl: string;
  name: string;
  perPage: number;
  supportedFeatures: string[];
}

// Tùy chọn cho crawler
export interface CrawlerOptions {
  source: string;
  startPage?: number;
  endPage?: number;
  mangaId?: string;
  useOriginalImages?: boolean;
  concurrency?: number;
  authToken?: string;
}

// Tùy chọn cho processor
export interface ProcessorOptions {
  useOriginalImages?: boolean;
  skipExisting?: boolean;
  downloadImages?: boolean;
}

// Định nghĩa manga chuẩn hóa
export interface StandardManga {
  sourceId: string; // ID từ nguồn gốc
  sourceName: string; // Tên nguồn
  slug: string;
  title: string;
  alternativeTitles?: Record<string, string>;
  description?: string;
  coverUrl: string;
  status: string;
  author?: string; // Tác giả/Artist
  views: number;
  genres: StandardGenre[];
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa chapter chuẩn hóa
export interface StandardChapter {
  sourceId: string;
  mangaSourceId: string;
  number: string;
  title?: string;
  slug: string;
  pages: string[];
  views: number;
  releasedAt: Date;
}

// Định nghĩa thể loại chuẩn hóa
export interface StandardGenre {
  sourceId: number | string;
  name: string;
  slug: string;
}

// Định nghĩa kết quả danh sách manga
export interface MangaListResult {
  mangas: StandardManga[];
  hasNextPage: boolean;
  nextPage?: number;
  total?: number;
}

// Định nghĩa kết quả danh sách chapter
export interface ChapterListResult {
  chapters: StandardChapter[];
  hasNextPage: boolean;
  nextPage?: number;
  total?: number;
}

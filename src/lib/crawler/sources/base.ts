/**
 * Interface cơ sở cho tất cả các nguồn crawler
 */

import { StandardManga, StandardChapter, MangaListResult, ChapterListResult } from '../types';

/**
 * Interface định nghĩa cấu hình của nguồn
 */
export interface SourceConfig {
  baseUrl: string;
  name: string;
  perPage: number;
  supportedFeatures: string[];
  requiresAuth: boolean;
  authToken?: string;
}

/**
 * Interface định nghĩa các phương thức mà mỗi nguồn phải triển khai
 */
export interface Source {
  /**
   * Lấy tên của nguồn
   */
  getName(): string;

  /**
   * Lấy cấu hình của nguồn
   */
  getConfig(): SourceConfig;

  /**
   * Lấy danh sách manga từ nguồn
   * @param page Trang cần lấy
   * @param options Tùy chọn bổ sung
   */
  fetchMangaList(page: number, options?: any): Promise<MangaListResult>;

  /**
   * Lấy chi tiết manga từ nguồn
   * @param id ID của manga
   * @param options Tùy chọn bổ sung
   */
  fetchMangaDetail(id: string, options?: any): Promise<StandardManga>;

  /**
   * Lấy danh sách chapter của manga
   * @param mangaId ID của manga
   * @param options Tùy chọn bổ sung
   */
  fetchChapters(mangaId: string, options?: any): Promise<ChapterListResult>;

  /**
   * Chuyển đổi dữ liệu manga từ nguồn sang định dạng chuẩn
   * @param data Dữ liệu manga từ nguồn
   */
  mapMangaToStandardFormat(data: any): StandardManga;

  /**
   * Chuyển đổi dữ liệu chapter từ nguồn sang định dạng chuẩn
   * @param data Dữ liệu chapter từ nguồn
   * @param mangaId ID của manga
   */
  mapChapterToStandardFormat(data: any, mangaId: string): StandardChapter;
}

/**
 * Lớp cơ sở cho tất cả các nguồn
 * Triển khai các phương thức chung
 */
export abstract class BaseSource implements Source {
  protected config: SourceConfig;

  constructor(config: SourceConfig) {
    this.config = config;
  }

  getName(): string {
    return this.config.name;
  }

  getConfig(): SourceConfig {
    return this.config;
  }

  abstract fetchMangaList(page: number, options?: any): Promise<MangaListResult>;
  abstract fetchMangaDetail(id: string, options?: any): Promise<StandardManga>;
  abstract fetchChapters(mangaId: string, options?: any): Promise<ChapterListResult>;
  abstract mapMangaToStandardFormat(data: any): StandardManga;
  abstract mapChapterToStandardFormat(data: any, mangaId: string): StandardChapter;
}

/**
 * Factory để quản lý các nguồn crawler
 */

import { Source } from './base';
import { MangaRawSource } from './mangaraw';

/**
 * Factory quản lý và cung cấp các nguồn crawler
 */
export class SourceFactory {
  private static sources: Map<string, Source> = new Map();
  private static initialized = false;

  /**
   * Khởi tạo factory và đăng ký các nguồn mặc định
   */
  static initialize(): void {
    if (this.initialized) return;
    
    // Đăng ký nguồn MangaRaw
    this.registerSource('mangaraw', new MangaRawSource());
    
    this.initialized = true;
  }

  /**
   * Đăng ký nguồn mới
   * @param name Tên của nguồn
   * @param source Instance của nguồn
   */
  static registerSource(name: string, source: Source): void {
    this.sources.set(name.toLowerCase(), source);
  }

  /**
   * Lấy nguồn theo tên
   * @param name Tên của nguồn
   * @returns Instance của nguồn
   * @throws Error nếu không tìm thấy nguồn
   */
  static getSource(name: string): Source {
    if (!this.initialized) {
      this.initialize();
    }
    
    const source = this.sources.get(name.toLowerCase());
    if (!source) {
      throw new Error(`Source "${name}" not found. Available sources: ${this.getSupportedSources().join(', ')}`);
    }
    return source;
  }

  /**
   * Lấy danh sách tên các nguồn đã đăng ký
   * @returns Mảng tên các nguồn
   */
  static getSupportedSources(): string[] {
    if (!this.initialized) {
      this.initialize();
    }
    
    return Array.from(this.sources.keys());
  }
}

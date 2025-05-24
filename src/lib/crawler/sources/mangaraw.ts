/**
 * Nguồn crawler từ MangaRaw
 */

import axios from 'axios';
import {
  StandardManga,
  StandardChapter,
  StandardGenre,
  MangaListResult,
  ChapterListResult
} from '../types';
import { BaseSource } from './base';

/**
 * Định nghĩa kiểu dữ liệu response từ MangaRaw API
 */
interface MangaRawResponse<T> {
  status: number;
  success: boolean;
  data: T;
  pagination?: {
    count: number;
    total: number;
    perPage: number;
    currentPage: number;
    totalPages: number;
    links: {
      next?: string;
    };
  };
}

/**
 * Định nghĩa kiểu dữ liệu manga từ MangaRaw API
 */
interface MangaRawManga {
  id: string;
  name: string;
  name_alt: string;
  pilot: string;
  status: number;
  views: number;
  views_day: number;
  views_week: number;
  slug: string;
  cover_full_url: string;
  created_at: string;
  updated_at: string;
  genres?: MangaRawGenre[];
  user?: any;
  artist?: any;
  group?: any;
  doujinshi?: any;
}

/**
 * Định nghĩa kiểu dữ liệu thể loại từ MangaRaw API
 */
interface MangaRawGenre {
  id: number;
  name: string;
  slug: string;
  show_on_pc: number;
  show_on_mb: number;
  created_at: string;
  updated_at: string;
  pivot: {
    manga_id: string;
    genre_id: number;
  };
}

/**
 * Định nghĩa kiểu dữ liệu chapter từ MangaRaw API
 */
interface MangaRawChapter {
  id: string;
  slug: string;
  user_id: string;
  manga_id: string;
  name: string;
  content: string[];
  views: number;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Nguồn MangaRaw
 */
export class MangaRawSource extends BaseSource {
  constructor() {
    super({
      name: 'MangaRaw',
      baseUrl: 'https://mangaraw.best/api/admin',
      perPage: 50,
      supportedFeatures: ['manga', 'chapter'],
      requiresAuth: true,
      authToken: process.env.MANGARAW_API_TOKEN || ''
    });
  }

  /**
   * Tạo headers cho request với Bearer token nếu có
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.config.authToken) {
      headers['Authorization'] = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  /**
   * Lấy danh sách manga từ MangaRaw
   */
  async fetchMangaList(page: number): Promise<MangaListResult> {
    const response = await axios.get<MangaRawResponse<MangaRawManga[]>>(`${this.config.baseUrl}/mangas`, {
      params: {
        page,
        per_page: this.config.perPage,
        include: 'genres'
      },
      headers: this.getHeaders()
    });

    const mangas = response.data.data.map(manga => this.mapMangaToStandardFormat(manga));

    return {
      mangas,
      hasNextPage: !!response.data.pagination?.links.next,
      nextPage: response.data.pagination?.currentPage ? response.data.pagination.currentPage + 1 : undefined,
      total: response.data.pagination?.total
    };
  }

  /**
   * Lấy chi tiết manga từ MangaRaw
   */
  async fetchMangaDetail(id: string): Promise<StandardManga> {
    const response = await axios.get<MangaRawResponse<MangaRawManga>>(`${this.config.baseUrl}/mangas/${id}`, {
      params: { include: 'group,user,genres,artist,doujinshi' },
      headers: this.getHeaders()
    });

    return this.mapMangaToStandardFormat(response.data.data);
  }

  /**
   * Lấy danh sách chapter của manga từ MangaRaw
   */
  async fetchChapters(mangaId: string): Promise<ChapterListResult> {
    const response = await axios.get<MangaRawResponse<MangaRawChapter[]>>(`${this.config.baseUrl}/chapters`, {
      params: { 'filter[manga_id]': mangaId, per_page: 999999 },
      headers: this.getHeaders()
    });

    const chapters = response.data.data.map(chapter =>
      this.mapChapterToStandardFormat(chapter, mangaId)
    );

    return {
      chapters,
      hasNextPage: !!response.data.pagination?.links.next,
      nextPage: response.data.pagination?.currentPage ? response.data.pagination.currentPage + 1 : undefined,
      total: response.data.pagination?.total
    };
  }

  /**
   * Chuyển đổi dữ liệu manga từ MangaRaw sang định dạng chuẩn
   */
  mapMangaToStandardFormat(data: MangaRawManga): StandardManga {
    // Chuyển đổi status code sang chuỗi
    const statusMap: Record<number, string> = {
      0: 'draft',
      2: 'ongoing',
      1: 'completed',
      3: 'cancelled',
      4: 'hiatus'
    };

    // Tạo alternative titles
    const alternativeTitles: Record<string, string> = {};
    if (data.name_alt) {
      alternativeTitles.en = data.name_alt;
    }

    // Chuyển đổi genres - đảm bảo xử lý cả trường hợp data.genres là undefined
    const genres: StandardGenre[] = [];

    if (Array.isArray(data.genres) && data.genres.length > 0) {
      data.genres.forEach(genre => {
        genres.push({
          sourceId: genre.id,
          name: genre.name,
          slug: genre.slug || genre.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        });
      });
    }

    return {
      sourceId: data.id,
      sourceName: this.getName(),
      title: data.name,
      slug: data.slug,
      alternativeTitles,
      description: data.pilot,
      coverUrl: data.cover_full_url,
      status: statusMap[data.status] || 'unknown',
      views: data.views,
      genres,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Chuyển đổi dữ liệu chapter từ MangaRaw sang định dạng chuẩn
   */
  mapChapterToStandardFormat(data: MangaRawChapter, mangaId: string): StandardChapter {
    return {
      sourceId: data.id,
      mangaSourceId: mangaId,
      number: data.order.toString(),
      title: data.name,
      slug: data.slug,
      pages: data.content.map(url => url.trim()),
      views: data.views,
      releasedAt: new Date(data.created_at)
    };
  }
}

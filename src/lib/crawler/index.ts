/**
 * Entry point cho crawler
 */

import pLimit from 'p-limit';
import { SourceFactory } from './sources/factory';
import { MangaProcessor } from './processors/manga';
import { ChapterProcessor } from './processors/chapter';
import { CrawlerOptions, ProcessorOptions } from './types';
import { sleep } from './utils';

// Cấu hình mặc định
const DEFAULT_CONFIG = {
  concurrency: 3,
  delayBetweenRequests: 1000,
  useOriginalImages: false,
  skipExisting: true,
};

/**
 * Chạy crawler với các tùy chọn
 * @param options Tùy chọn crawler
 */
export async function runCrawler(options: CrawlerOptions): Promise<void> {
  try {
    console.log('Starting manga crawler...');
    console.log(`Source: ${options.source}`);

    // Lấy nguồn từ factory
    const source = SourceFactory.getSource(options.source || 'mangaraw');

    // Cập nhật token xác thực nếu có
    if (options.authToken && source.getConfig().requiresAuth) {
      (source as any).config.authToken = options.authToken;
    }

    // Khởi tạo processors
    const mangaProcessor = new MangaProcessor();
    const chapterProcessor = new ChapterProcessor();

    // Cấu hình processor
    const processorOptions: ProcessorOptions = {
      useOriginalImages: options.useOriginalImages ?? DEFAULT_CONFIG.useOriginalImages,
      skipExisting: DEFAULT_CONFIG.skipExisting,
    };

    // Giới hạn concurrency
    const concurrencyLimit = pLimit(options.concurrency || DEFAULT_CONFIG.concurrency);

    // Nếu có manga ID cụ thể
    if (options.mangaId) {
      console.log(`Crawling specific manga ID: ${options.mangaId}`);

      // Lấy chi tiết manga
      const manga = await source.fetchMangaDetail(options.mangaId);

      // Xử lý manga
      const comicId = await mangaProcessor.process(manga, processorOptions);

      // Lấy và xử lý chapters
      const chaptersResult = await source.fetchChapters(options.mangaId);
      await chapterProcessor.processMany(chaptersResult.chapters, comicId, processorOptions);

      console.log(`Completed crawling manga: ${manga.title}`);
      return;
    }

    // Crawl nhiều manga
    let currentPage = options.startPage || 1;
    const endPage = options.endPage;
    let hasNextPage = true;

    while (hasNextPage) {
      console.log(`Crawling page ${currentPage}...`);

      // Lấy danh sách manga
      const mangaListResult = await source.fetchMangaList(currentPage);

      if (!mangaListResult.mangas || mangaListResult.mangas.length === 0) {
        console.log('No manga found on this page.');
        hasNextPage = false;
        break;
      }

      // Xử lý các manga trong trang hiện tại
      const promises = mangaListResult.mangas.map(manga =>
        concurrencyLimit(async () => {
          try {
            console.log(`Processing manga: ${manga.title}`);

            // Xử lý manga
            const comicId = await mangaProcessor.process(manga, processorOptions);

            // Lấy và xử lý chapters
            const chaptersResult = await source.fetchChapters(manga.sourceId);
            await chapterProcessor.processMany(chaptersResult.chapters, comicId, processorOptions);

            // Tránh rate limiting
            await sleep(DEFAULT_CONFIG.delayBetweenRequests);
          } catch (error) {
            console.error(`Error processing manga ${manga.title}:`, error);
          }
        })
      );

      await Promise.all(promises);

      // Kiểm tra nếu đã đến trang cuối hoặc đạt đến trang kết thúc
      currentPage++;
      hasNextPage = mangaListResult.hasNextPage && (!endPage || currentPage <= endPage);

      // Tránh rate limiting giữa các trang
      if (hasNextPage) {
        await sleep(DEFAULT_CONFIG.delayBetweenRequests * 2);
      }
    }

    console.log('Crawler completed successfully.');
  } catch (error) {
    console.error('Crawler failed:', error);
    throw error;
  }
}

/**
 * Lấy danh sách các nguồn hỗ trợ
 * @returns Danh sách tên các nguồn
 */
export function getSupportedSources(): string[] {
  return SourceFactory.getSupportedSources();
}

// Re-export các types và components
export * from './types';
export * from './sources/factory';
export * from './processors/manga';
export * from './processors/chapter';

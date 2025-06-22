/**
 * Entry point cho crawler
 */

import pLimit from 'p-limit';
import { SourceFactory } from './sources/factory';
import { MangaProcessor } from './processors/manga';
import { ChapterProcessor } from './processors/chapter';
import { CrawlerOptions, ProcessorOptions } from './types';
import { sleep } from './utils';
import { connectionManager } from './connection-manager';

// Cấu hình mặc định - giảm concurrency để tránh quá tải database
const DEFAULT_CONFIG = {
  concurrency: 1, // Giảm xuống 1 để tránh hoàn toàn quá tải database
  delayBetweenRequests: 3000, // Tăng delay lên 3s
  useOriginalImages: true, // Luôn sử dụng URL gốc, không download ảnh
  skipExisting: false, // Không skip để luôn kiểm tra cập nhật
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
      forceUpdateChapters: options.forceUpdateChapters || false,
    };

    // Giới hạn concurrency - giảm xuống để tránh quá tải database
    const concurrencyLimit = pLimit(1); // Force sequential processing

    // Nếu có manga ID cụ thể
    if (options.mangaId) {
      console.log(`Crawling specific manga ID: ${options.mangaId}`);

      try {
        // Lấy chi tiết manga
        const manga = await source.fetchMangaDetail(options.mangaId);

        // Xử lý manga
        const comicId = await mangaProcessor.process(manga, processorOptions);

        // Lấy và xử lý chapters
        const chaptersResult = await source.fetchChapters(options.mangaId);
        await chapterProcessor.processMany(chaptersResult.chapters, comicId, processorOptions);

        console.log(`Completed crawling manga: ${manga.title}`);
      } catch (error) {
        console.error(`Error processing manga ${options.mangaId}:`, error);
        throw error;
      }
      return;
    }

    // Crawl nhiều manga
    let currentPage = options.startPage || 1;
    const endPage = options.endPage;
    let hasNextPage = true;

    while (hasNextPage) {
      console.log(`Crawling page ${currentPage}...`);
      console.log(`Connection status:`, connectionManager.getStatus());

      try {
        // Lấy danh sách manga
        const mangaListResult = await source.fetchMangaList(currentPage);

        if (!mangaListResult.mangas || mangaListResult.mangas.length === 0) {
          console.log('No manga found on this page.');
          hasNextPage = false;
          break;
        }

        // Xử lý các manga trong trang hiện tại - tuần tự để tránh quá tải
        for (const manga of mangaListResult.mangas) {
          try {
            console.log(`Processing manga: ${manga.title}`);

            // Xử lý manga
            const comicId = await mangaProcessor.process(manga, processorOptions);

            // Lấy và xử lý chapters
            const chaptersResult = await source.fetchChapters(manga.sourceId);
            await chapterProcessor.processMany(chaptersResult.chapters, comicId, processorOptions);

            console.log(`✅ Completed processing manga: ${manga.title}`);

            // Tránh rate limiting
            await sleep(DEFAULT_CONFIG.delayBetweenRequests);
          } catch (error) {
            console.error(`❌ Error processing manga ${manga.title}:`, error);
            // Thêm delay khi có lỗi để tránh spam
            await sleep(DEFAULT_CONFIG.delayBetweenRequests);
          }
        }

        // Kiểm tra nếu đã đến trang cuối hoặc đạt đến trang kết thúc
        currentPage++;
        hasNextPage = mangaListResult.hasNextPage && (!endPage || currentPage <= endPage);

        // Tránh rate limiting giữa các trang
        if (hasNextPage) {
          await sleep(DEFAULT_CONFIG.delayBetweenRequests * 2);
        }
      } catch (error) {
        console.error(`Error processing page ${currentPage}:`, error);
        // Tiếp tục với trang tiếp theo
        currentPage++;
        hasNextPage = (!endPage || currentPage <= endPage);
        await sleep(DEFAULT_CONFIG.delayBetweenRequests);
      }
    }

    console.log('Crawler completed successfully.');
  } catch (error) {
    console.error('Crawler failed:', error);
    throw error;
  } finally {
    // Đảm bảo cleanup connection manager
    try {
      await connectionManager.cleanup();
      console.log('Database connections cleaned up successfully.');
    } catch (disconnectError) {
      console.error('Error cleaning up database connections:', disconnectError);
    }
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

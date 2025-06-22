/**
 * Processor xử lý dữ liệu chapter
 */

import { StandardChapter, ProcessorOptions } from '../types';
import { prisma } from '@/lib/db';
import { withConnection } from '../connection-manager';

/**
 * Processor xử lý và lưu trữ dữ liệu chapter
 */
export class ChapterProcessor {
  /**
   * Xử lý danh sách chapter và lưu vào database
   * @param chapters Danh sách chapter chuẩn hóa
   * @param comicId ID của manga trong database
   * @param options Tùy chọn xử lý
   */
  async processMany(
    chapters: StandardChapter[],
    comicId: number,
    options: ProcessorOptions = {}
  ): Promise<void> {
    // Xử lý chapters theo batch để tránh quá tải database
    const batchSize = 3; // Giảm batch size từ 5 xuống 3
    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);
      
      // Xử lý batch tuần tự để tránh quá tải database
      for (const chapter of batch) {
        await this.process(chapter, comicId, options);
      }
      
      // Thêm delay nhỏ giữa các batch
      if (i + batchSize < chapters.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Cập nhật thời gian upload chapter mới nhất
    if (chapters.length > 0) {
      await withConnection(async () => {
        return prisma.comics.update({
          where: { id: comicId },
          data: {
            last_chapter_uploaded_at: new Date(),
          },
        });
      });
    }
  }

  /**
   * Xử lý một chapter và lưu vào database
   * @param chapter Chapter chuẩn hóa
   * @param comicId ID của manga trong database
   * @param options Tùy chọn xử lý
   * @returns ID của chapter trong database
   */
  async process(
    chapter: StandardChapter,
    comicId: number,
    options: ProcessorOptions = {}
  ): Promise<number> {
    return withConnection(async () => {
      try {
        // Chuyển đổi chapter.number từ string sang float
        const chapterNumber = parseFloat(chapter.number);

        // Kiểm tra chapter đã tồn tại chưa
        const existingChapter = await prisma.chapters.findUnique({
          where: {
            comic_id_chapter_number: {
              comic_id: comicId,
              chapter_number: chapterNumber,
            },
          },
          include: {
            Pages: {
              select: { page_number: true, image_url: true },
              orderBy: { page_number: 'asc' }
            }
          }
        });

        // Chuẩn bị dữ liệu chapter
        const chapterData = {
          comic_id: comicId,
          chapter_number: chapterNumber,
          title: chapter.title,
          slug: chapter.slug,
          release_date: chapter.releasedAt,
          view_count: chapter.views,
          updated_at: new Date(),
        };

        // Upsert chapter để tránh lỗi duplicate
        const savedChapter = await prisma.chapters.upsert({
          where: {
            comic_id_chapter_number: {
              comic_id: comicId,
              chapter_number: chapterNumber,
            },
          },
          update: chapterData,
          create: {
            ...chapterData,
            created_at: chapter.releasedAt,
          },
        });

        // Kiểm tra và xử lý pages chỉ khi có thay đổi
        const shouldUpdatePages = await this.shouldUpdatePages(
          existingChapter?.Pages || [], 
          chapter.pages,
          options.forceUpdateChapters || false
        );

        if (shouldUpdatePages) {
          await this.processPages(savedChapter.id, chapter.pages, options);
          console.log(`📄 Updated pages for chapter: ${chapter.number} (ID: ${savedChapter.id})`);
        } else {
          console.log(`✅ Pages unchanged for chapter: ${chapter.number} (ID: ${savedChapter.id})`);
        }

        return savedChapter.id;
      } catch (error) {
        console.error(`Error processing chapter ${chapter.number}:`, error);
        throw error;
      }
    });
  }

  /**
   * Kiểm tra xem có cần cập nhật pages không
   * @param existingPages Pages hiện tại trong database
   * @param newPageUrls URLs pages mới từ crawler
   * @param forceUpdate true nếu cần force update
   * @returns true nếu cần cập nhật
   */
  private async shouldUpdatePages(
    existingPages: Array<{ page_number: number; image_url: string }>,
    newPageUrls: string[],
    forceUpdate: boolean = false
  ): Promise<boolean> {
    try {
      // Nếu force update được bật
      if (forceUpdate) {
        console.log(`🔄 Force updating pages (forceUpdateChapters enabled)`);
        return true;
      }

      // Nếu số lượng pages khác nhau
      if (existingPages.length !== newPageUrls.length) {
        console.log(`📊 Page count changed: ${existingPages.length} -> ${newPageUrls.length}`);
        return true;
      }

      // Nếu chưa có pages nào
      if (existingPages.length === 0) {
        return true;
      }

      // So sánh từng page URL
      for (let i = 0; i < newPageUrls.length; i++) {
        const newUrl = newPageUrls[i].trim();
        const existingPage = existingPages.find(p => p.page_number === i + 1);
        
        if (!existingPage || existingPage.image_url !== newUrl) {
          console.log(`🔄 Page ${i + 1} URL changed:`);
          console.log(`   Old: ${existingPage?.image_url || 'N/A'}`);
          console.log(`   New: ${newUrl}`);
          return true;
        }
      }

      // Không có thay đổi nào
      return false;
    } catch (error) {
      console.error('Error checking page updates:', error);
      // Nếu có lỗi, coi như cần cập nhật để đảm bảo data integrity
      return true;
    }
  }

  /**
   * Xử lý và lưu pages của chapter
   * @param chapterId ID của chapter trong database
   * @param pageUrls Danh sách URL của pages
   * @param options Tùy chọn xử lý
   */
  private async processPages(
    chapterId: number,
    pageUrls: string[],
    options: ProcessorOptions = {}
  ): Promise<void> {
    // Xóa pages cũ
    await prisma.pages.deleteMany({
      where: { chapter_id: chapterId },
    });

    // Thêm pages mới theo batch - không download ảnh, chỉ lưu URL gốc
    const batchSize = 10;
    for (let i = 0; i < pageUrls.length; i += batchSize) {
      const batch = pageUrls.slice(i, i + batchSize);
      const pagesData = [];

      for (let j = 0; j < batch.length; j++) {
        const pageUrl = batch[j].trim();
        const pageNumber = i + j + 1;

        // Sử dụng URL gốc thay vì download
        pagesData.push({
          chapter_id: chapterId,
          page_number: pageNumber,
          image_url: pageUrl, // Sử dụng URL gốc
          created_at: new Date(),
        });
      }

      // Lưu batch pages vào database
      await prisma.pages.createMany({
        data: pagesData,
      });
    }

    console.log(`📄 Processed ${pageUrls.length} pages for chapter ${chapterId} (using original URLs)`);
  }
}

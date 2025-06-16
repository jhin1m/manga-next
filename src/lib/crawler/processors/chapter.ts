/**
 * Processor xử lý dữ liệu chapter
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { StandardChapter, ProcessorOptions } from '../types';

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PAGES_DIR = path.join(PUBLIC_DIR, 'images/pages');

// Đảm bảo thư mục tồn tại
fs.ensureDirSync(PAGES_DIR);

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
    for (const chapter of chapters) {
      await this.process(chapter, comicId, options);
    }

    // Cập nhật thời gian upload chapter mới nhất
    if (chapters.length > 0) {
      await prisma.comics.update({
        where: { id: comicId },
        data: {
          last_chapter_uploaded_at: new Date(),
        },
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
    try {
      // Chuyển đổi chapter.number từ string sang float
      const chapterNumber = parseFloat(chapter.number);

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

      // Xử lý pages
      await this.processPages(savedChapter.id, chapter.pages, options);

      console.log(`Processed chapter: ${chapter.number} (ID: ${savedChapter.id})`);

      return savedChapter.id;
    } catch (error) {
      console.error(`Error processing chapter ${chapter.number}:`, error);
      throw error;
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

    // Thêm pages mới
    for (let i = 0; i < pageUrls.length; i++) {
      const pageUrl = pageUrls[i].trim();
      const pageNumber = i + 1;

      // Xử lý image URL
      const imageUrl = await this.processPageImage(pageUrl, chapterId, pageNumber, options);

      // Lưu page vào database
      await prisma.pages.create({
        data: {
          chapter_id: chapterId,
          page_number: pageNumber,
          image_url: imageUrl,
          created_at: new Date(),
        },
      });
    }
  }

  /**
   * Xử lý và lưu page image
   * @param url URL của page image
   * @param chapterId ID của chapter
   * @param pageNumber Số thứ tự của page
   * @param options Tùy chọn xử lý
   * @returns URL của page image đã xử lý
   */
  private async processPageImage(
    url: string,
    chapterId: number,
    pageNumber: number,
    options: ProcessorOptions
  ): Promise<string> {
    // Nếu không download ảnh, trả về URL gốc
    if (options.useOriginalImages) {
      return url;
    }

    try {
      const extension = path.extname(new URL(url).pathname) || '.jpg';
      const chapterDir = path.join(PAGES_DIR, `${chapterId}`);
      fs.ensureDirSync(chapterDir);

      const filename = `${pageNumber}${extension}`;
      const filePath = path.join(chapterDir, filename);

      // Kiểm tra nếu file đã tồn tại và không cần tải lại
      if ((await fs.pathExists(filePath)) && options.skipExisting) {
        return `/images/pages/${chapterId}/${filename}`;
      }

      // Tải ảnh
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Lưu hình ảnh gốc để giữ chất lượng
      await fs.writeFile(filePath, buffer);

      return `/images/pages/${chapterId}/${filename}`;
    } catch (error) {
      console.error(
        `Error processing page image for chapter ${chapterId}, page ${pageNumber}:`,
        error
      );
      return url; // Nếu có lỗi, trả về URL gốc
    }
  }
}

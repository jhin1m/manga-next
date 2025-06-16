/**
 * Processor xử lý dữ liệu manga
 */

import { PrismaClient, Prisma } from '@prisma/client';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { StandardManga, ProcessorOptions } from '../types';

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const COVERS_DIR = path.join(PUBLIC_DIR, 'images/covers');

// Đảm bảo thư mục tồn tại
fs.ensureDirSync(COVERS_DIR);

/**
 * Processor xử lý và lưu trữ dữ liệu manga
 */
export class MangaProcessor {
  /**
   * Xử lý manga và lưu vào database
   * @param manga Dữ liệu manga chuẩn hóa
   * @param options Tùy chọn xử lý
   * @returns ID của manga trong database
   */
  async process(manga: StandardManga, options: ProcessorOptions = {}): Promise<number> {
    try {
      // Xử lý cover image
      const coverImageUrl = await this.processCoverImage(manga.coverUrl, manga.slug, options);

      // Chuẩn bị dữ liệu manga
      const comicData = {
        title: manga.title,
        slug: manga.slug,
        alternative_titles: manga.alternativeTitles || {},
        description: manga.description,
        cover_image_url: coverImageUrl,
        status: manga.status,
        total_views: manga.views,
        updated_at: new Date(),
      };

      // Sử dụng transaction với timeout tăng lên 30 giây
      const comic = await prisma.$transaction(
        async tx => {
          // Upsert manga
          const comic = await tx.comics.upsert({
            where: { slug: manga.slug },
            update: comicData,
            create: {
              ...comicData,
              created_at: manga.createdAt,
            },
          });

          // Xử lý genres nếu có - truyền transaction client
          if (manga.genres && manga.genres.length > 0) {
            await this.processGenres(tx, comic.id, manga.genres);
          }

          return comic;
        },
        {
          maxWait: 30000, // Tăng thời gian chờ tối đa lên 30 giây
          timeout: 30000, // Tăng thời gian timeout lên 30 giây
        }
      );

      console.log(`Successfully processed manga: ${manga.title} (ID: ${comic.id})`);
      return comic.id;
    } catch (error) {
      console.error(`Error processing manga ${manga.title}:`, error);

      // Log additional details for debugging
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);
        if (error.message.includes('P2003')) {
          console.error(
            'Foreign key constraint violation detected. This may be due to transaction scope issues.'
          );
        }
      }

      throw error;
    }
  }

  /**
   * Xử lý và lưu cover image
   * @param url URL của cover image
   * @param slug Slug của manga
   * @param options Tùy chọn xử lý
   * @returns URL của cover image đã xử lý
   */
  private async processCoverImage(
    url: string,
    slug: string,
    options: ProcessorOptions
  ): Promise<string> {
    // Nếu không download ảnh, trả về URL gốc
    if (options.useOriginalImages) {
      return url;
    }

    try {
      const extension = path.extname(new URL(url).pathname) || '.jpg';
      const filename = `${slug}${extension}`;
      const filePath = path.join(COVERS_DIR, filename);

      // Kiểm tra nếu file đã tồn tại và không cần tải lại
      if ((await fs.pathExists(filePath)) && options.skipExisting) {
        return `/images/covers/${filename}`;
      }

      // Tải ảnh
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Tối ưu hình ảnh trước khi lưu
      await sharp(buffer)
        .resize(500) // Chiều rộng tối đa
        .jpeg({ quality: 80 })
        .toFile(filePath);

      return `/images/covers/${filename}`;
    } catch (error) {
      console.error(`Error processing cover image for ${slug}:`, error);
      return url; // Nếu có lỗi, trả về URL gốc
    }
  }

  /**
   * Xử lý và lưu thể loại
   * @param tx Transaction client từ Prisma
   * @param comicId ID của manga trong database
   * @param genres Danh sách thể loại
   */
  private async processGenres(
    tx: Prisma.TransactionClient,
    comicId: number,
    genres: { sourceId: number | string; name: string; slug: string }[]
  ): Promise<void> {
    try {
      // Validate input parameters
      if (!comicId || !genres || !Array.isArray(genres)) {
        console.warn('Invalid parameters for processGenres:', { comicId, genres });
        return;
      }

      // Xóa genres cũ
      await tx.comic_Genres.deleteMany({
        where: { comic_id: comicId },
      });

      // Thêm genres mới
      for (const genre of genres) {
        // Validate genre data
        if (!genre.name || !genre.slug) {
          console.warn('Invalid genre data:', genre);
          continue;
        }

        // Upsert genre để tránh duplicate
        const savedGenre = await tx.genres.upsert({
          where: { slug: genre.slug },
          update: { name: genre.name },
          create: {
            name: genre.name,
            slug: genre.slug,
            created_at: new Date(),
          },
        });

        // Liên kết comic với genre
        await tx.comic_Genres.create({
          data: {
            comic_id: comicId,
            genre_id: savedGenre.id,
          },
        });
      }
    } catch (error) {
      console.error(`Error processing genres for comic ${comicId}:`, error);
      throw error;
    }
  }
}

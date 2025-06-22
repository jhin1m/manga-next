/**
 * Processor xử lý dữ liệu manga
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { StandardManga, ProcessorOptions } from '../types';
import { prisma } from '@/lib/db';
import { withConnection } from '../connection-manager';

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
    return withConnection(async () => {
      try {
        // Kiểm tra manga đã tồn tại chưa
        const existingManga = await prisma.comics.findUnique({
          where: { slug: manga.slug },
          select: { id: true, cover_image_url: true }
        });

        // Kiểm tra và xử lý cover image (luôn kiểm tra cập nhật)
        const coverImageUrl = await this.checkAndUpdateCoverImage(
          manga.coverUrl, 
          manga.slug, 
          existingManga?.cover_image_url
        );

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
    });
  }

  /**
   * Kiểm tra và cập nhật cover image (không download, chỉ so sánh URL)
   * @param newUrl URL của cover image mới
   * @param slug Slug của manga
   * @param existingUrl URL cover image hiện tại (nếu có)
   * @returns URL của cover image (sử dụng URL gốc)
   */
  private async checkAndUpdateCoverImage(
    newUrl: string,
    slug: string,
    existingUrl: string | null | undefined
  ): Promise<string> {
    try {
      // Nếu chưa có ảnh bìa cũ
      if (!existingUrl) {
        console.log(`🆕 New cover image for ${slug}: ${newUrl}`);
        return newUrl;
      }

      // So sánh URL để kiểm tra thay đổi
      if (existingUrl !== newUrl) {
        console.log(`🔄 Cover image updated for ${slug}:`);
        console.log(`   Old: ${existingUrl}`);
        console.log(`   New: ${newUrl}`);
        return newUrl;
      } else {
        console.log(`✅ Cover image unchanged for ${slug}`);
        return existingUrl;
      }

    } catch (error) {
      console.error(`Error checking cover image for ${slug}:`, error);
      return newUrl; // Nếu có lỗi, trả về URL mới
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

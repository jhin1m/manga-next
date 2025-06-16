#!/usr/bin/env ts-node
/**
 * CLI tool để chạy manga crawler với chức năng sync
 *
 * Cách sử dụng:
 * npx ts-node scripts/crawl.ts [source] [startPage] [endPage] [options]
 *
 * Ví dụ:
 * npx ts-node scripts/crawl.ts mangaraw 1 5 --use-original-images
 * npx ts-node scripts/crawl.ts mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487
 * npx ts-node scripts/crawl.ts mangaraw --sync --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487
 */

// Sử dụng require thay vì import để tránh lỗi ES modules
const crawler = require('../src/lib/crawler/index');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load biến môi trường từ file .env
dotenv.config();

// Khởi tạo Prisma client
const prisma = new PrismaClient();

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    source: string;
    startPage: number;
    endPage?: number;
    help: boolean;
    useOriginalImages?: boolean;
    mangaId?: string;
    concurrency?: number;
    authToken?: string;
    sync?: boolean;
  } = {
    source: 'mangaraw',
    startPage: 1,
    help: false,
  };

  // Hiển thị help nếu không có tham số hoặc có flag --help
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    options.help = true;
    return options;
  }

  // Parse các tham số vị trí
  if (args[0] && !args[0].startsWith('-')) {
    options.source = args[0];
  }

  if (args[1] && !args[1].startsWith('-')) {
    options.startPage = parseInt(args[1], 10);
  }

  if (args[2] && !args[2].startsWith('-')) {
    options.endPage = parseInt(args[2], 10);
  }

  // Parse các tham số flag
  for (const arg of args) {
    if (arg === '--use-original-images') {
      options.useOriginalImages = true;
    } else if (arg === '--sync') {
      options.sync = true;
    } else if (arg.startsWith('--manga-id=')) {
      options.mangaId = arg.split('=')[1];
    } else if (arg.startsWith('--concurrency=')) {
      options.concurrency = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--auth-token=')) {
      options.authToken = arg.split('=')[1];
    }
  }

  return options;
}

// Hiển thị hướng dẫn sử dụng
function showHelp() {
  console.log(`
Manga Crawler CLI

Cách sử dụng:
  npx ts-node scripts/crawl.ts [source] [startPage] [endPage] [options]

Tham số:
  source                     Tên nguồn (mặc định: mangaraw)
  startPage                  Trang bắt đầu (mặc định: 1)
  endPage                    Trang kết thúc (tùy chọn)

Options:
  --manga-id=<id>            Crawl một manga cụ thể theo ID
  --use-original-images      Sử dụng URL ảnh gốc thay vì tải về
  --concurrency=<number>     Số lượng request đồng thời (mặc định: 3)
  --auth-token=<token>       Token xác thực (nếu không có sẽ dùng từ biến môi trường)
  --sync                     Chế độ sync - cập nhật chapters (cần --manga-id hoặc sync toàn bộ)
  -h, --help                 Hiển thị hướng dẫn này

Ví dụ:
  npx ts-node scripts/crawl.ts mangaraw 1 5 --use-original-images
  npx ts-node scripts/crawl.ts mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487
  npx ts-node scripts/crawl.ts mangaraw --sync --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487
  npx ts-node scripts/crawl.ts mangaraw --sync

Nguồn hỗ trợ:
  ${crawler.getSupportedSources().join(', ')}
  `);
}

// Hàm sync toàn bộ manga đã có trong database
async function syncAllManga(options: any) {
  const { SourceFactory } = require('../src/lib/crawler/sources/factory');

  try {
    // Lấy nguồn từ factory
    const source = SourceFactory.getSource(options.source || 'mangaraw');

    // Cập nhật token xác thực nếu có
    if (options.authToken && source.getConfig().requiresAuth) {
      source.config.authToken = options.authToken;
    }

    // Lấy tất cả manga từ database
    const allManga = await prisma.comics.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        updated_at: true,
      },
      orderBy: {
        updated_at: 'asc', // Sync manga cũ nhất trước
      },
    });

    if (allManga.length === 0) {
      console.log('❌ Không có manga nào trong database để sync');
      return;
    }

    console.log(`📚 Tìm thấy ${allManga.length} manga trong database`);
    console.log('🔄 Bắt đầu sync toàn bộ...');

    let totalNew = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < allManga.length; i++) {
      const manga = allManga[i];
      console.log(`\n📖 [${i + 1}/${allManga.length}] Sync manga: ${manga.title}`);

      try {
        // Tạo options cho manga này
        const mangaOptions = {
          ...options,
          mangaId: manga.slug, // Sử dụng slug làm ID
        };

        // Gọi hàm sync cho manga này
        const result = await syncSingleMangaInternal(mangaOptions, source);

        if (result) {
          totalNew += result.newCount;
          totalUpdated += result.updatedCount;
          totalDeleted += result.deletedCount;
          successCount++;
        }

        // Delay giữa các manga để tránh rate limiting
        if (i < allManga.length - 1) {
          console.log('⏳ Chờ 2 giây...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(
          `❌ Lỗi sync manga ${manga.title}:`,
          error instanceof Error ? error.message : error
        );
        errorCount++;

        // Tiếp tục với manga tiếp theo
        continue;
      }
    }

    console.log('\n🎉 Sync toàn bộ hoàn thành!');
    console.log(`📊 Tổng kết:`);
    console.log(`   - Manga thành công: ${successCount}/${allManga.length}`);
    console.log(`   - Manga lỗi: ${errorCount}`);
    console.log(`   - Chapters mới: ${totalNew}`);
    console.log(`   - Chapters cập nhật: ${totalUpdated}`);
    console.log(`   - Chapters xóa: ${totalDeleted}`);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình sync toàn bộ:', error);
    throw error;
  }
}

// Hàm sync một manga và trả về kết quả
async function syncSingleMangaInternal(options: any, source: any) {
  try {
    // Lấy thông tin manga từ database
    const existingManga = await prisma.comics.findFirst({
      where: {
        OR: [
          { slug: options.mangaId },
          { id: isNaN(parseInt(options.mangaId)) ? undefined : parseInt(options.mangaId) },
        ],
      },
      include: {
        Chapters: {
          include: {
            Pages: true,
          },
        },
      },
    });

    if (!existingManga) {
      console.log('❌ Không tìm thấy manga trong database');
      return null;
    }

    // Lấy chapters từ source
    const chaptersResult = await source.fetchChapters(options.mangaId);
    console.log(`📥 Tìm thấy ${chaptersResult.chapters.length} chapters từ source`);

    let updatedCount = 0;
    let newCount = 0;
    let deletedCount = 0;

    // So sánh và cập nhật chapters
    for (const sourceChapter of chaptersResult.chapters) {
      const chapterNumber = parseFloat(sourceChapter.number);
      const existingChapter = existingManga.Chapters.find(
        (ch: any) => ch.chapter_number === chapterNumber
      );

      if (existingChapter) {
        // Kiểm tra xem có thay đổi không
        const hasChanges =
          existingChapter.title !== sourceChapter.title ||
          existingChapter.Pages.length !== sourceChapter.pages.length;

        if (hasChanges) {
          console.log(`🔄 Cập nhật chapter ${chapterNumber}: ${sourceChapter.title}`);

          // Cập nhật chapter
          await prisma.chapters.update({
            where: { id: existingChapter.id },
            data: {
              title: sourceChapter.title,
              slug: sourceChapter.slug,
              updated_at: new Date(),
            },
          });

          // Cập nhật pages nếu khác
          if (existingChapter.Pages.length !== sourceChapter.pages.length) {
            await prisma.pages.deleteMany({
              where: { chapter_id: existingChapter.id },
            });

            for (let i = 0; i < sourceChapter.pages.length; i++) {
              await prisma.pages.create({
                data: {
                  chapter_id: existingChapter.id,
                  page_number: i + 1,
                  image_url: options.useOriginalImages
                    ? sourceChapter.pages[i]
                    : sourceChapter.pages[i],
                  created_at: new Date(),
                },
              });
            }
          }

          updatedCount++;
        }
      } else {
        // Chapter mới
        console.log(`➕ Thêm chapter mới ${chapterNumber}: ${sourceChapter.title}`);

        const newChapter = await prisma.chapters.create({
          data: {
            comic_id: existingManga.id,
            chapter_number: chapterNumber,
            title: sourceChapter.title,
            slug: sourceChapter.slug,
            release_date: sourceChapter.releasedAt,
            view_count: sourceChapter.views || 0,
            created_at: sourceChapter.releasedAt,
            updated_at: new Date(),
          },
        });

        for (let i = 0; i < sourceChapter.pages.length; i++) {
          await prisma.pages.create({
            data: {
              chapter_id: newChapter.id,
              page_number: i + 1,
              image_url: options.useOriginalImages
                ? sourceChapter.pages[i]
                : sourceChapter.pages[i],
              created_at: new Date(),
            },
          });
        }

        newCount++;
      }
    }

    // Kiểm tra chapters bị xóa
    const sourceChapterNumbers = chaptersResult.chapters.map((ch: any) => parseFloat(ch.number));
    const chaptersToDelete = existingManga.Chapters.filter(
      (ch: any) => !sourceChapterNumbers.includes(ch.chapter_number)
    );

    for (const chapterToDelete of chaptersToDelete) {
      console.log(`🗑️ Xóa chapter ${chapterToDelete.chapter_number}: ${chapterToDelete.title}`);
      await prisma.chapters.delete({
        where: { id: chapterToDelete.id },
      });
      deletedCount++;
    }

    // Cập nhật thời gian sync cho manga
    await prisma.comics.update({
      where: { id: existingManga.id },
      data: {
        updated_at: new Date(),
        last_chapter_uploaded_at: new Date(),
      },
    });

    console.log(
      `✅ Sync hoàn thành: ${newCount} mới, ${updatedCount} cập nhật, ${deletedCount} xóa`
    );

    return { newCount, updatedCount, deletedCount };
  } catch (error) {
    console.error('❌ Lỗi sync manga:', error);
    throw error;
  }
}

// Hàm sync chapters cho một manga cụ thể hoặc toàn bộ
async function runSyncMode(options: any) {
  console.log('🔄 Bắt đầu chế độ sync...');

  if (!options.mangaId) {
    console.log('📚 Không có manga-id, sẽ sync toàn bộ manga đã có trong database...');
    await syncAllManga(options);
    return;
  }

  const { SourceFactory } = require('../src/lib/crawler/sources/factory');

  try {
    // Lấy nguồn từ factory
    const source = SourceFactory.getSource(options.source || 'mangaraw');

    // Cập nhật token xác thực nếu có
    if (options.authToken && source.getConfig().requiresAuth) {
      source.config.authToken = options.authToken;
    }

    console.log(`📖 Đang sync manga ID: ${options.mangaId}`);

    // Sử dụng hàm sync internal
    const result = await syncSingleMangaInternal(options, source);

    if (!result) {
      console.log('❌ Không tìm thấy manga trong database. Chạy crawl thông thường...');
      await crawler.runCrawler(options);
      return;
    }
  } catch (error) {
    console.error('❌ Lỗi trong quá trình sync:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Hàm main
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('Manga Crawler CLI');
  console.log('=================');
  console.log(`Source: ${options.source}`);

  if (options.mangaId) {
    console.log(`Manga ID: ${options.mangaId}`);
  } else {
    console.log(`Trang: ${options.startPage}${options.endPage ? ` đến ${options.endPage}` : ''}`);
  }

  console.log(`Sử dụng ảnh gốc: ${options.useOriginalImages ? 'Có' : 'Không'}`);
  console.log(`Concurrency: ${options.concurrency || 3}`);
  console.log(
    `Auth token: ${options.authToken ? 'Được cung cấp' : process.env.MANGARAW_API_TOKEN ? 'Từ biến môi trường' : 'Không có'}`
  );
  console.log(`Chế độ sync: ${options.sync ? 'Có' : 'Không'}`);
  console.log('=================');

  try {
    if (options.sync) {
      await runSyncMode(options);
    } else {
      await crawler.runCrawler(options);
    }
    console.log('Crawler hoàn thành thành công!');
  } catch (error) {
    console.error('Crawler thất bại:', error);
    process.exit(1);
  } finally {
    if (!options.sync) {
      await prisma.$disconnect();
    }
  }
}

// Chạy script
main().catch(error => {
  console.error('Lỗi không mong muốn:', error);
  process.exit(1);
});

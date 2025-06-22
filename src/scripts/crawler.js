#!/usr/bin/env node
/**
 * Script crawler để chạy từ Next.js CLI (CommonJS version)
 *
 * Cách sử dụng:
 * node src/scripts/crawler.js [source] [startPage] [endPage] [options]
 */

// Register ts-node to handle TypeScript imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('ts-node').register({
  project: './tsconfig.crawler.json',
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { runCrawler, getSupportedSources } = require('../lib/crawler');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const options = {
    source: args[0] || 'mangaraw',
    startPage: args[1] ? parseInt(args[1]) : undefined,
    endPage: args[2] ? parseInt(args[2]) : undefined,
    useOriginalImages: true,
    concurrency: 1, // Giảm concurrency mặc định để tránh "too many clients"
    authToken: process.env.MANGARAW_API_TOKEN,
    mangaId: undefined,
    forceUpdateChapters: false,
  };

  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--manga-id=')) {
      options.mangaId = arg.split('=')[1];
    } else if (arg === '--use-original-images') {
      options.useOriginalImages = true;
    } else if (arg === '--force-update-chapters') {
      options.forceUpdateChapters = true;
    } else if (arg.startsWith('--concurrency=')) {
      const concurrency = parseInt(arg.split('=')[1]) || 1;
      // Giới hạn concurrency tối đa là 2 để tránh quá tải database
      options.concurrency = Math.min(concurrency, 2);
      if (concurrency > 2) {
        console.log('⚠️  Concurrency được giới hạn tối đa là 2 để tránh quá tải database');
      }
    } else if (arg.startsWith('--auth-token=')) {
      options.authToken = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
Manga Crawler CLI Tool

Cách sử dụng:
  node src/scripts/crawler.js [source] [startPage] [endPage] [options]

Tham số:
  source                         Nguồn crawler (mặc định: mangaraw)
  startPage                      Trang bắt đầu (mặc định: 1)
  endPage                        Trang kết thúc (tùy chọn)

Options:
  --manga-id=<id>            Crawl một manga cụ thể theo ID
  --use-original-images      Sử dụng URL ảnh gốc (luôn bật, không download ảnh về server)
  --force-update-chapters    Force update tất cả chapters ngay cả khi content không đổi
  --concurrency=<number>     Số lượng request đồng thời (mặc định: 1, tối đa: 2)
  --auth-token=<token>       Token xác thực (nếu không có sẽ dùng từ biến môi trường)
  -h, --help                 Hiển thị hướng dẫn này

Ví dụ:
  node src/scripts/crawler.js mangaraw 1 5
  node src/scripts/crawler.js mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487
  node src/scripts/crawler.js mangaraw 1 3 --force-update-chapters

Tính năng mới:
  - ✅ Auto kiểm tra cập nhật ảnh bìa manga
  - 🌐 Sử dụng URL gốc thay vì download ảnh về server
  - 🔄 So sánh URL để phát hiện ảnh bìa mới
  - 📄 Smart chapter update: chỉ cập nhật khi content thay đổi
  - 🔄 Force update option cho chapters khi cần
  - 💾 Tiết kiệm dung lượng server

Lưu ý về Database:
  - Crawler đã được tối ưu để tránh lỗi "too many database connections"
  - Concurrency mặc định được giảm xuống 1 để đảm bảo ổn định
  - Sử dụng connection pooling và batch processing
  - Khuyến nghị chạy với concurrency=1 cho môi trường production

Nguồn hỗ trợ:
  ${getSupportedSources().join(', ')}

Kiểm tra Database:
  python3 scripts/check-db-connections.py check    # Kiểm tra connections
  python3 scripts/check-db-connections.py clean    # Dọn dẹp idle connections
  `);
}

/**
 * Main function
 */
async function main() {
  const options = parseArguments();

  console.log('=================');
  console.log('MANGA CRAWLER CLI');
  console.log('=================');
  console.log(`Nguồn: ${options.source}`);

  if (options.mangaId) {
    console.log(`Manga ID: ${options.mangaId}`);
  } else {
    console.log(`Trang bắt đầu: ${options.startPage || 1}`);
    if (options.endPage) {
      console.log(`Trang kết thúc: ${options.endPage}`);
    }
  }

  console.log(`Sử dụng ảnh gốc: ${options.useOriginalImages ? 'Có' : 'Không'} (luôn bật)`);
  console.log(`Concurrency: ${options.concurrency || 1} (tối ưu cho database)`);
  console.log(`Force update chapters: ${options.forceUpdateChapters ? 'Có' : 'Không'}`);
  console.log(
    `Auth token: ${options.authToken ? 'Được cung cấp' : process.env.MANGARAW_API_TOKEN ? 'Từ biến môi trường' : 'Không có'}`
  );
  console.log('=================');
  console.log('🔧 Database Connection Management: Enabled');
  console.log('📊 Connection Pooling: Active');
  console.log('⚡ Batch Processing: Optimized');
  console.log('🖼️  Cover Image Update Check: Auto Enabled');
  console.log('🌐 Image Storage: Original URLs (No Download)');
  console.log('📄 Smart Chapter Update: Content Comparison Enabled');
  console.log('=================');

  try {
    await runCrawler(options);
    console.log('✅ Crawler hoàn thành thành công!');
  } catch (error) {
    console.error('❌ Crawler thất bại:', error);
    
    // Kiểm tra nếu là lỗi database connection
    if (error.message && error.message.includes('too many clients')) {
      console.error('\n🚨 LỖI DATABASE CONNECTION:');
      console.error('   - Quá nhiều kết nối database đang mở');
      console.error('   - Khuyến nghị: Chạy script dọn dẹp connections');
      console.error('   - Command: python3 scripts/check-db-connections.py clean');
      console.error('   - Hoặc giảm concurrency: --concurrency=1');
    }
    
    process.exit(1);
  }
}

// Chạy script
main().catch(error => {
  console.error('Lỗi không mong muốn:', error);
  process.exit(1);
});

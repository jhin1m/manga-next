#!/usr/bin/env node
/**
 * CLI tool để chạy manga crawler
 *
 * Cách sử dụng:
 * node scripts/crawl.js [source] [startPage] [endPage] [options]
 *
 * Ví dụ:
 * node scripts/crawl.js mangaraw 1 5 --use-original-images
 * node scripts/crawl.js mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487
 */

// Sử dụng require thay vì import để tránh lỗi ES modules
const { runCrawler, getSupportedSources } = require('../dist/lib/crawler');
const dotenv = require('dotenv');

// Load biến môi trường từ file .env
dotenv.config();

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
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
  node scripts/crawl.js [source] [startPage] [endPage] [options]

Tham số:
  source                     Tên nguồn (mặc định: mangaraw)
  startPage                  Trang bắt đầu (mặc định: 1)
  endPage                    Trang kết thúc (tùy chọn)

Options:
  --manga-id=<id>            Crawl một manga cụ thể theo ID
  --use-original-images      Sử dụng URL ảnh gốc thay vì tải về
  --concurrency=<number>     Số lượng request đồng thời (mặc định: 3)
  --auth-token=<token>       Token xác thực (nếu không có sẽ dùng từ biến môi trường)
  -h, --help                 Hiển thị hướng dẫn này

Ví dụ:
  node scripts/crawl.js mangaraw 1 5 --use-original-images
  node scripts/crawl.js mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487

Nguồn hỗ trợ:
  ${getSupportedSources().join(', ')}
  `);
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
  console.log('=================');

  try {
    await runCrawler(options);
    console.log('Crawler hoàn thành thành công!');
  } catch (error) {
    console.error('Crawler thất bại:', error);
    process.exit(1);
  }
}

// Chạy script
main().catch(error => {
  console.error('Lỗi không mong muốn:', error);
  process.exit(1);
});

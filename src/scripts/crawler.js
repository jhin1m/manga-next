#!/usr/bin/env node
/**
 * Script crawler để chạy từ Next.js CLI (CommonJS version)
 * 
 * Cách sử dụng:
 * node src/scripts/crawler.js [source] [startPage] [endPage] [options]
 */

// Register ts-node to handle TypeScript imports
require('ts-node').register({
  project: './tsconfig.crawler.json'
});

const { runCrawler, getSupportedSources } = require('../lib/crawler');
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
    useOriginalImages: false,
    concurrency: 3,
    authToken: process.env.MANGARAW_API_TOKEN,
    mangaId: undefined
  };

  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--manga-id=')) {
      options.mangaId = arg.split('=')[1];
    } else if (arg === '--use-original-images') {
      options.useOriginalImages = true;
    } else if (arg.startsWith('--concurrency=')) {
      options.concurrency = parseInt(arg.split('=')[1]) || 3;
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
  --use-original-images      Sử dụng URL ảnh gốc thay vì tải về
  --concurrency=<number>     Số lượng request đồng thời (mặc định: 3)
  --auth-token=<token>       Token xác thực (nếu không có sẽ dùng từ biến môi trường)
  -h, --help                 Hiển thị hướng dẫn này

Ví dụ:
  node src/scripts/crawler.js mangaraw 1 5 --use-original-images
  node src/scripts/crawler.js mangaraw --manga-id=20463a51-7faf-4a3f-9e67-5c624f80d487

Nguồn hỗ trợ:
  ${getSupportedSources().join(', ')}
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
  
  console.log(`Sử dụng ảnh gốc: ${options.useOriginalImages ? 'Có' : 'Không'}`);
  console.log(`Concurrency: ${options.concurrency || 3}`);
  console.log(`Auth token: ${options.authToken ? 'Được cung cấp' : (process.env.MANGARAW_API_TOKEN ? 'Từ biến môi trường' : 'Không có')}`);
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

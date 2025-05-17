/**
 * API endpoint để chạy crawler
 */

import { NextResponse } from 'next/server';
import { runCrawler, getSupportedSources, CrawlerOptions } from '@/lib/crawler';

/**
 * Xử lý POST request để chạy crawler
 */
export async function POST(request: Request) {
  try {
    // Parse body
    const body = await request.json();
    
    // Chuẩn bị options
    const options: CrawlerOptions = {
      source: body.source || 'mangaraw',
      startPage: body.startPage || 1,
      endPage: body.endPage,
      mangaId: body.mangaId,
      useOriginalImages: body.useOriginalImages !== undefined ? body.useOriginalImages : false,
      concurrency: body.concurrency || 3,
      authToken: body.authToken || process.env.MANGARAW_API_TOKEN
    };
    
    // Kiểm tra source có hợp lệ không
    const supportedSources = getSupportedSources();
    if (!supportedSources.includes(options.source.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Source "${options.source}" not supported. Available sources: ${supportedSources.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Chạy crawler không đồng bộ
    runCrawler(options).catch(error => {
      console.error('Crawler failed:', error);
    });
    
    // Tạo message
    let message = `Started crawler from source: ${options.source}`;
    if (options.mangaId) {
      message += ` for manga ID: ${options.mangaId}`;
    } else {
      message += ` from page ${options.startPage}${options.endPage ? ` to ${options.endPage}` : ''}`;
    }
    
    message += ` (using ${options.useOriginalImages ? 'original' : 'downloaded'} images)`;
    
    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Crawler API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start crawler' },
      { status: 500 }
    );
  }
}

/**
 * Xử lý GET request để lấy danh sách nguồn hỗ trợ
 */
export async function GET() {
  try {
    const sources = getSupportedSources();
    
    return NextResponse.json({
      success: true,
      sources
    });
  } catch (error) {
    console.error('Error getting sources:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get sources' },
      { status: 500 }
    );
  }
}

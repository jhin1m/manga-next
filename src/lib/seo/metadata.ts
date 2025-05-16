import type { Metadata } from 'next';

// Cấu trúc cơ bản cho metadata
export interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: string;
  noIndex?: boolean;
}

// Tạo metadata cơ bản cho tất cả các trang
export function constructMetadata({
  title = 'Dokinaw - 無料漫画サイト',
  description = '無料で漫画が読めるサイト。人気漫画から名作漫画まで幅広く揃えています。',
  keywords = ['manga', 'comic', 'read manga', 'free manga', 'online manga', 'dokinaw'],
  image = '/images/og-image.jpg', // Đảm bảo có file này trong thư mục public/images
  type = 'website',
  noIndex = false,
}: MetadataProps = {}): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type as 'website' | 'article' | 'book' | 'profile',
      siteName: 'Dokinaw',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    alternates: {
      canonical: 'https://dokinaw.com', // Cần cập nhật theo từng trang
    },
    metadataBase: new URL('https://dokinaw.com'), // Thay đổi URL thực tế khi triển khai
  };
}

// Hàm tạo metadata cho trang manga cụ thể
export function constructMangaMetadata(manga: any): Metadata {
  const title = `${manga.title} - Dokinaw`;
  const description = manga.description 
    ? `${manga.description.substring(0, 150)}...` 
    : `Read ${manga.title} manga online for free on Dokinaw.`;
  
  const keywords = [
    manga.title,
    ...manga.genres?.map((genre: any) => genre.name) || [],
    'manga', 'read online', 'free'
  ];
  
  const image = manga.coverImage || '/images/og-image.jpg';
  
  return constructMetadata({
    title,
    description,
    keywords,
    image,
    type: 'article',
  });
}

// Hàm tạo metadata cho trang chapter
export function constructChapterMetadata(manga: any, chapter: any): Metadata {
  const title = `${manga.title} - Chapter ${chapter.number} - Dokinaw`;
  const description = `Read ${manga.title} Chapter ${chapter.number} online for free on Dokinaw.`;
  
  const keywords = [
    manga.title,
    `Chapter ${chapter.number}`,
    ...manga.genres?.map((genre: any) => genre.name) || [],
    'manga', 'read online', 'free'
  ];
  
  const image = chapter.coverImage || manga.coverImage || '/images/og-image.jpg';
  
  return constructMetadata({
    title,
    description,
    keywords,
    image,
    type: 'article',
  });
}

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import JsonLdScript from '@/components/seo/JsonLdScript';
import { generateHomeJsonLd } from '@/lib/seo/jsonld';
import HomePageClient from '@/components/feature/HomePageClient';
import { seoConfig, getSiteUrl } from '@/config/seo.config';
import { defaultViewport } from '@/lib/seo/viewport';

// Homepage now uses shell UI with async data loading for optimal performance

// Tạo metadata cho trang chủ
export const metadata: Metadata = constructMetadata({
  title: seoConfig.seo.defaultTitle,
  description: seoConfig.site.description,
  keywords: [...seoConfig.site.keywords, 'latest manga', 'popular manga', 'completed manga'],
  canonical: getSiteUrl(),
});

export const viewport = defaultViewport;

// Optimized ISR for homepage - shorter revalidation for better UX
// Reduced from 1 hour to 15 minutes for more responsive content updates
export const revalidate = 900; // 15 minutes

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // Get the current page from the URL query parameters
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  // Tạo JSON-LD cho trang chủ
  const jsonLd = generateHomeJsonLd();

  // Use shell mode for instant UI rendering
  // Data will be loaded asynchronously in the background
  return (
    <>
      <JsonLdScript id='home-jsonld' jsonLd={jsonLd} />
      <HomePageClient useShellMode={true} currentPage={currentPage} />
    </>
  );
}

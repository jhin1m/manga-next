import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import JsonLdScript from '@/components/seo/JsonLdScript';
import { generateHomeJsonLd } from '@/lib/seo/jsonld';
// import HomePageClient from '@/components/feature/HomePageClient';
import SidebarServer from '@/components/feature/SidebarServer';
import { seoConfig, getSiteUrl } from '@/config/seo.config';
import { defaultViewport } from '@/lib/seo/viewport';
import { fetchHomePageData } from '@/lib/data/homepage';
import HotMangaSliderClient from '@/components/feature/HotMangaSliderClient';
import LatestUpdateMangaListClient from '@/components/feature/LatestUpdateMangaListClient';
import ViewMoreButton from '@/components/ui/ViewMoreButton';

// Enable Static Site Generation for homepage
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Tạo metadata cho trang chủ
export const metadata: Metadata = constructMetadata({
  title: seoConfig.seo.defaultTitle,
  description: seoConfig.site.description,
  keywords: [...seoConfig.site.keywords, 'latest manga', 'popular manga', 'completed manga'],
  canonical: getSiteUrl(),
});

export const viewport = defaultViewport;

export default async function Home() {
  // Fetch data at build time for SSG
  const data = await fetchHomePageData();

  // Tạo JSON-LD cho trang chủ
  const jsonLd = generateHomeJsonLd();

  // Render components directly in server component for SSG
  return (
    <>
      <JsonLdScript id='home-jsonld' jsonLd={jsonLd} />
      <div className='container mx-auto py-8 space-y-8'>
        {/* Hot Manga Slider */}
        <HotMangaSliderClient hotManga={data.hotManga} />

        {/* Main Content + Sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8'>
          {/* Main Content */}
          <section className='space-y-6'>
            {/* Latest Update Manga List */}
            <LatestUpdateMangaListClient manga={data.latestManga} />

            {/* View More Button */}
            <ViewMoreButton href='/manga?page=2' />
          </section>

          {/* Sidebar - Server Component for SSG */}
          <aside className='space-y-6 lg:block'>
            <SidebarServer sidebarData={data.sidebarData} />
          </aside>
        </div>
      </div>
    </>
  );
}

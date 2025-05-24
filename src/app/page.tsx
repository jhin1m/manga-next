import { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateHomeJsonLd } from "@/lib/seo/jsonld";
import HotMangaSlider from "@/components/feature/HotMangaSlider";
import LatestUpdateMangaList from "@/components/feature/LatestUpdateMangaList";
import Sidebar from "@/components/feature/Sidebar";
import Link from "next/link";

// Note: API calls replaced with direct database access in components for build-time safety

// Tạo metadata cho trang chủ
export const metadata: Metadata = constructMetadata({
  title: 'Dokinaw - 無料漫画サイト',
  description: '無料で漫画が読めるサイト。人気漫画から名作漫画まで幅広く揃えています。最新の漫画を無料で読むことができます。',
  keywords: ['manga', 'read manga online', 'free manga', 'latest manga', 'popular manga', 'completed manga', 'dokinaw'],
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Get the current page from the URL query parameters
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  // Tạo JSON-LD cho trang chủ
  const jsonLd = generateHomeJsonLd();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <JsonLdScript id="home-jsonld" jsonLd={jsonLd} />

      {/* Hot Manga Slider */}
      <HotMangaSlider />

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
        {/* Main Content */}
        <section className="space-y-6">
          {/* Latest Update Manga List */}
          <LatestUpdateMangaList page={currentPage} limit={16} />

          {/* View More Button */}
          <div className="flex justify-center mt-8">
            <Link href="/manga?page=2" className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-md text-center transition-colors duration-200">
              View more manga
            </Link>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 lg:block">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}

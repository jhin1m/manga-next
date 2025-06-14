import { Metadata } from "next";
import { notFound } from "next/navigation";
import MangaReader from "@/components/manga/MangaReader";
import { constructChapterMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateChapterJsonLd } from "@/lib/seo/jsonld";
import { mangaApi, chapterApi } from '@/lib/api/client';

// Function to get chapter data from API using centralized API client
async function getChapterData(mangaSlug: string, chapterSlug: string) {
  try {
    // First, get the chapter list to find the chapter ID from slug
    // Use getAllChapters to get all chapters for proper navigation
    const chaptersData = await mangaApi.getAllChapters(mangaSlug);
    const chapter = chaptersData.chapters.find((ch: any) => ch.slug === chapterSlug);

    if (!chapter) {
      console.error('Chapter not found in chapters list');
      return null;
    }

    // Now fetch the chapter content with the chapter ID using centralized API client
    const chapterData = await chapterApi.getDetail(chapter.id);

    // Chuyển đổi dữ liệu API để phù hợp với các component
    return {
      manga: {
        id: chapterData.chapter.Comics.id.toString(),
        title: chapterData.chapter.Comics.title,
        slug: chapterData.chapter.Comics.slug,
        cover_image_url: chapterData.chapter.Comics.cover_image_url || '',
      },
      chapter: {
        id: chapterData.chapter.id.toString(),
        number: parseFloat(chapterData.chapter.chapter_number),
        title: chapterData.chapter.title || `Chapter ${chapterData.chapter.chapter_number}`,
        slug: chapterData.chapter.slug,
        images: chapterData.chapter.Pages.map((page: any) => page.image_url),
      },
      navigation: {
        // Sử dụng trực tiếp slug từ API
        prevChapter: chapterData.prevChapter ? chapterData.prevChapter.slug : null,
        nextChapter: chapterData.nextChapter ? chapterData.nextChapter.slug : null,
        totalChapters: chaptersData.totalChapters,
      },
      // Thêm danh sách các chương để hiển thị trong dropdown
      chapters: chaptersData.chapters.map((ch: any) => ({
        id: ch.id.toString(),
        number: parseFloat(ch.chapter_number),
        title: ch.title || `Chapter ${ch.chapter_number}`,
        slug: ch.slug,
      })),
    };
  } catch (error) {
    console.error('Error fetching chapter data:', error);
    return null;
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const paramData = await params;
  const { slug, chapterSlug } = paramData;
  const chapterData = await getChapterData(slug, chapterSlug);

  if (!chapterData) {
    return {
      title: "Chapter Not Found",
      robots: { index: false, follow: false }
    };
  }

  // Sử dụng utility function để tạo metadata chuẩn SEO
  return constructChapterMetadata({
    manga: {
      title: chapterData.manga.title,
      slug: chapterData.manga.slug,
      coverImage: chapterData.chapter.images[0] || '',
      genres: [],
    },
    chapter: {
      number: chapterData.chapter.number,
      title: chapterData.chapter.title,
      images: chapterData.chapter.images,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    chapterSlug: chapterSlug,
  });
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}) {
  const paramData = await params;
  const { slug, chapterSlug } = paramData;
  const chapterData = await getChapterData(slug, chapterSlug);

  if (!chapterData) {
    notFound();
  }

  // Tạo JSON-LD cho trang chapter
  const jsonLd = generateChapterJsonLd({
    manga: {
      title: chapterData.manga.title,
      slug: chapterData.manga.slug,
      coverImage: chapterData.chapter.images[0] || '',
      genres: [],
    },
    chapter: {
      number: chapterData.chapter.number,
      title: chapterData.chapter.title,
      images: chapterData.chapter.images,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    chapterSlug: chapterSlug,
  });

  return (
    <>
      <JsonLdScript id="chapter-jsonld" jsonLd={jsonLd} />
      <MangaReader chapterData={chapterData} />
    </>
  );
}

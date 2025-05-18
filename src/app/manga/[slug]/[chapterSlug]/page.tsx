import { Metadata } from "next";
import { notFound } from "next/navigation";
import MangaReader from "@/components/manga/MangaReader";
import { constructChapterMetadata } from "@/lib/seo/metadata";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { generateChapterJsonLd } from "@/lib/seo/jsonld";

// Function to get chapter data from API
async function getChapterData(mangaSlug: string, chapterSlug: string) {
  try {
    // First, we need to get the chapter ID from the slug
    const chaptersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga/${mangaSlug}/chapters`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!chaptersRes.ok) {
      console.error('Failed to fetch chapters list');
      return null;
    }

    const chaptersData = await chaptersRes.json();
    const chapter = chaptersData.chapters.find((ch: any) => ch.slug === chapterSlug);

    if (!chapter) {
      console.error('Chapter not found in chapters list');
      return null;
    }

    // Now fetch the chapter content with the chapter ID
    const chapterRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/chapters/${chapter.id}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!chapterRes.ok) {
      console.error('Failed to fetch chapter content');
      return null;
    }

    const chapterData = await chapterRes.json();

    // Chuyển đổi dữ liệu API để phù hợp với các component
    return {
      manga: {
        id: chapterData.chapter.Comics.id.toString(),
        title: chapterData.chapter.Comics.title,
        slug: chapterData.chapter.Comics.slug,
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
  params: { slug: string; chapterSlug: string };
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
  return constructChapterMetadata(
    {
      title: chapterData.manga.title,
      description: `Read ${chapterData.manga.title} manga online for free on Dokinaw.`,
      coverImage: chapterData.chapter.images[0] || '',
      genres: [],
    },
    {
      number: chapterData.chapter.number,
      title: chapterData.chapter.title,
      coverImage: chapterData.chapter.images[0] || '',
    }
  );
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapterSlug: string };
}) {
  const paramData = await params;
  const { slug, chapterSlug } = paramData;
  const chapterData = await getChapterData(slug, chapterSlug);

  if (!chapterData) {
    notFound();
  }

  // Tạo JSON-LD cho trang chapter
  const jsonLd = generateChapterJsonLd(
    {
      title: chapterData.manga.title,
      slug: chapterData.manga.slug,
      coverImage: chapterData.chapter.images[0] || '',
    },
    {
      number: chapterData.chapter.number,
      title: chapterData.chapter.title,
      coverImage: chapterData.chapter.images[0] || '',
      pageCount: chapterData.chapter.images.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  return (
    <>
      <JsonLdScript id="chapter-jsonld" jsonLd={jsonLd} />
      <MangaReader chapterData={chapterData} />
    </>
  );
}

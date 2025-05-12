import { Metadata } from "next";
import { notFound } from "next/navigation";
import MangaReader from "@/components/manga/MangaReader";

// Function to get chapter data from API
async function getChapterData(slug: string, chapterId: string) {
  try {
    // First, we need to get the chapter ID from the slug
    const chaptersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manga/${slug}/chapters`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!chaptersRes.ok) {
      console.error('Failed to fetch chapters list');
      return null;
    }

    const chaptersData = await chaptersRes.json();
    const chapter = chaptersData.chapters.find((ch: any) => ch.slug === chapterId);

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

    // Transform API data to match our component needs
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
        images: chapterData.chapter.Pages.map((page: any) => page.image_url),
      },
      navigation: {
        prevChapter: chapterData.prevChapter ? chapterData.prevChapter.id.toString() : null,
        nextChapter: chapterData.nextChapter ? chapterData.nextChapter.id.toString() : null,
        totalChapters: chaptersData.totalChapters,
      },
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
  params: { slug: string; chapterId: string };
}): Promise<Metadata> {
  const { slug, chapterId } = params;
  const chapterData = await getChapterData(slug, chapterId);

  if (!chapterData) {
    return {
      title: "Chapter Not Found",
    };
  }

  return {
    title: `${chapterData.chapter.title} - ${chapterData.manga.title}`,
    description: `Read ${chapterData.manga.title} ${chapterData.chapter.title} online for free.`,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; chapterId: string };
}) {
  const { slug, chapterId } = params;
  const chapterData = await getChapterData(slug, chapterId);

  if (!chapterData) {
    notFound();
  }

  return <MangaReader chapterData={chapterData} />;
}

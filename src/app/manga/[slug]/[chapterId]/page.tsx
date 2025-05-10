import { Metadata } from "next";
import { notFound } from "next/navigation";
import MangaReader from "@/components/manga/MangaReader";

// Mock function to get chapter data
const getChapterData = (slug: string, chapterId: string) => {
  // This would be replaced with an actual API call in a real application
  const chapterNumber = parseInt(chapterId.replace("chapter-", ""));
  
  // Check if chapter exists (for demo purposes)
  if (chapterNumber < 1 || chapterNumber > 1089) {
    return null;
  }
  
  return {
    manga: {
      id: "1",
      title: "One Piece",
      slug: "one-piece",
    },
    chapter: {
      id: `1-chapter-${chapterNumber}`,
      number: chapterNumber,
      title: `Chapter ${chapterNumber}`,
      images: Array.from({ length: 15 }, (_, i) => 
        // Using placeholder images for demo
        `https://placehold.co/800x1200/png?text=Chapter+${chapterNumber}+Page+${i+1}`
      ),
    },
    navigation: {
      prevChapter: chapterNumber > 1 ? `chapter-${chapterNumber - 1}` : null,
      nextChapter: chapterNumber < 1089 ? `chapter-${chapterNumber + 1}` : null,
      totalChapters: 1089,
    },
  };
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterId: string }>;
}): Promise<Metadata> {
  const { slug, chapterId } = await params;
  const chapterData = getChapterData(slug, chapterId);
  
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
  params: Promise<{ slug: string; chapterId: string }>;
}) {
  const { slug, chapterId } = await params;
  const chapterData = getChapterData(slug, chapterId);
  
  if (!chapterData) {
    notFound();
  }
  
  return <MangaReader chapterData={chapterData} />;
}

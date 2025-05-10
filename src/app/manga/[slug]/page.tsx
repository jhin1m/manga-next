import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Clock, Eye, BookOpen, Heart } from "lucide-react";
import MangaChapterList from "@/components/manga/MangaChapterList";
import RelatedManga from "@/components/manga/RelatedManga";
import Description from "@/components/manga/Description";

// Mock data for a single manga
const getMangaBySlug = (slug: string) => {
  // This would be replaced with an actual API call in a real application
  return {
    id: "1",
    title: "One Piece",
    alternativeTitles: ["ワンピース", "Wan Pīsu"],
    coverImage: "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
    slug: "one-piece",
    author: "Oda Eiichiro",
    artist: "Oda Eiichiro",
    description:
      "Gol D. Roger, a man referred to as the \"Pirate King,\" is set to be executed by the World Government. But just before his death, he confirms the existence of a great treasure, One Piece, located somewhere within the vast ocean known as the Grand Line. Announcing that One Piece can be claimed by anyone worthy enough to reach it, the Pirate King is executed and the Great Age of Pirates begins.\n\nTwenty-two years later, a young man by the name of Monkey D. Luffy is ready to embark on his own adventure, searching for One Piece and striving to become the new Pirate King. Armed with just a straw hat, a small boat, and an elastic body, he sets out on a fantastic journey to gather a crew and a ship worthy of taking on the Grand Line and finding the greatest treasure in the world.",
    genres: ["Action", "Adventure", "Fantasy", "Shounen"],
    status: "Ongoing",
    rating: 9.2,
    views: 1250000,
    favorites: 450000,
    chapterCount: 1089,
    updatedAt: "19 hours ago",
    publishedYear: 1997,
    serialization: "Weekly Shounen Jump",
  };
};

// Mock data for chapters
const getChapters = (mangaId: string) => {
  // This would be replaced with an actual API call in a real application
  return Array.from({ length: 30 }, (_, i) => {
    const chapterNumber = 1089 - i;
    return {
      id: `${mangaId}-chapter-${chapterNumber}`,
      number: chapterNumber,
      title: `Chapter ${chapterNumber}`,
      slug: `chapter-${chapterNumber}`,
      releaseDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      views: Math.floor(Math.random() * 100000) + 50000,
    };
  });
};

// Mock data for related manga
const getRelatedManga = (mangaId: string) => {
  // This would be replaced with an actual API call in a real application
  return [
    {
      id: "2",
      title: "Jujutsu Kaisen",
      coverImage: "https://cdn.myanimelist.net/images/manga/3/216464.jpg",
      slug: "jujutsu-kaisen",
      latestChapter: "Chapter 253",
      genres: ["Action", "Supernatural", "Horror"],
      rating: 8.7,
      views: 980000,
      chapterCount: 253,
      updatedAt: "2 days ago",
      status: "Ongoing",
    },
    {
      id: "3",
      title: "Demon Slayer",
      coverImage: "https://cdn.myanimelist.net/images/manga/3/179023.jpg",
      slug: "demon-slayer",
      latestChapter: "Chapter 205",
      genres: ["Action", "Supernatural"],
      rating: 8.5,
      views: 920000,
      chapterCount: 205,
      updatedAt: "Completed",
      status: "Completed",
    },
    {
      id: "4",
      title: "My Hero Academia",
      coverImage: "https://cdn.myanimelist.net/images/manga/1/209370.jpg",
      slug: "my-hero-academia",
      latestChapter: "Chapter 420",
      genres: ["Action", "Superhero"],
      rating: 8.3,
      views: 850000,
      chapterCount: 420,
      updatedAt: "1 day ago",
      status: "Ongoing",
    },
    {
      id: "5",
      title: "Naruto",
      coverImage: "https://cdn.myanimelist.net/images/manga/3/117681.jpg",
      slug: "naruto",
      latestChapter: "Chapter 700",
      genres: ["Action", "Adventure", "Fantasy"],
      rating: 8.1,
      views: 1100000,
      chapterCount: 700,
      updatedAt: "Completed",
      status: "Completed",
    },
    {
      id: "6",
      title: "Dragon Ball",
      coverImage: "https://cdn.myanimelist.net/images/manga/3/117681.jpg",
      slug: "dragon-ball",
      latestChapter: "Chapter 519",
      genres: ["Action", "Adventure", "Comedy"],
      rating: 8.4,
      views: 980000,
      chapterCount: 519,
      updatedAt: "Completed",
      status: "Completed",
    },
  ];
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const manga = getMangaBySlug(slug);

  return {
    title: `${manga.title} - Read Manga Online`,
    description: manga.description.substring(0, 160) + "...",
    openGraph: {
      title: manga.title,
      description: manga.description.substring(0, 160) + "...",
      images: [
        {
          url: manga.coverImage,
          width: 800,
          height: 1200,
          alt: manga.title,
        },
      ],
    },
  };
}

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const manga = getMangaBySlug(slug);
  const chapters = getChapters(manga.id);
  const relatedManga = getRelatedManga(manga.id);

  // Format view count (e.g., 1200000 -> 1.2M)
  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="space-y-8">
      {/* Manga Information Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-14">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Manga Details */}
        <div className="md:col-span-3 space-y-4">
          <h1 className="text-3xl font-bold">{manga.title}</h1>

          {manga.alternativeTitles && manga.alternativeTitles.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Alternative Titles: {manga.alternativeTitles.join(", ")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {manga.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{manga.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatViews(manga.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{manga.chapterCount} chapters</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{formatViews(manga.favorites)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="font-medium">{manga.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Author:</span>{" "}
              <span className="font-medium">{manga.author}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Artist:</span>{" "}
              <span className="font-medium">{manga.artist}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Published:</span>{" "}
              <span className="font-medium">{manga.publishedYear}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Serialization:</span>{" "}
              <span className="font-medium">{manga.serialization}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>{" "}
              <span className="font-medium">{manga.updatedAt}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/manga/${manga.slug}/chapter-1`}>
                Read First Chapter
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/manga/${manga.slug}/chapter-${manga.chapterCount}`}>
                Read Latest Chapter
              </Link>
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4" /> Add to Favorites
            </Button>
          </div>


        </div>
      </section>
      
      {/* Description here */}
      <Description description={manga.description} />


      {/* Chapters and Related Manga Section - 2/3 and 1/3 layout for PC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapters Section - 2/3 width on PC */}
        <section className="lg:col-span-2">
          <MangaChapterList
            mangaSlug={manga.slug}
            chapters={chapters}
          />
        </section>

        {/* Related Manga Section - 1/3 width on PC */}
        <section className="lg:col-span-1">
          <RelatedManga relatedManga={relatedManga} />
        </section>
      </div>
    </div>
  );
}

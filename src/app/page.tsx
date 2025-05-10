'use client';

import Link from "next/link";
import MangaCard from "@/components/feature/MangaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Mock data for demonstration with real manga covers
const mangaData = [
  {
    id: "1",
    title: "One Piece",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/253146.jpg",
    slug: "one-piece",
    latestChapter: "Chapter 1089",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 9.2,
    views: 1250000,
    chapterCount: 1089,
    updatedAt: "19 hours ago",
    status: "Ongoing",
  },
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
    title: "Chainsaw Man",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/216464.jpg",
    slug: "chainsaw-man",
    latestChapter: "Chapter 156",
    genres: ["Action", "Horror", "Supernatural"],
    rating: 8.9,
    views: 870000,
    chapterCount: 156,
    updatedAt: "3 days ago",
    status: "Ongoing",
  },
  {
    id: "4",
    title: "My Hero Academia",
    coverImage: "https://cdn.myanimelist.net/images/manga/1/209370.jpg",
    slug: "my-hero-academia",
    latestChapter: "Chapter 420",
    genres: ["Action", "Superhero", "School"],
    rating: 8.4,
    views: 750000,
    chapterCount: 420,
    updatedAt: "2 days ago",
    status: "Ongoing",
  },
  {
    id: "5",
    title: "Demon Slayer",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/179023.jpg",
    slug: "demon-slayer",
    latestChapter: "Chapter 205",
    genres: ["Action", "Supernatural", "Historical"],
    rating: 8.8,
    views: 1100000,
    chapterCount: 205,
    updatedAt: "Completed",
    status: "Completed",
  },
  {
    id: "6",
    title: "Tokyo Revengers",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/188896.jpg",
    slug: "tokyo-revengers",
    latestChapter: "Chapter 278",
    genres: ["Action", "Drama", "Supernatural"],
    rating: 8.2,
    views: 650000,
    chapterCount: 278,
    updatedAt: "Completed",
    status: "Completed",
  },
  {
    id: "7",
    title: "Spy x Family",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/219741.jpg",
    slug: "spy-x-family",
    latestChapter: "Chapter 89",
    genres: ["Action", "Comedy", "Slice of Life"],
    rating: 9.0,
    views: 920000,
    chapterCount: 89,
    updatedAt: "5 days ago",
    status: "Ongoing",
  },
  {
    id: "8",
    title: "Attack on Titan",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/37846.jpg",
    slug: "attack-on-titan",
    latestChapter: "Chapter 139",
    genres: ["Action", "Drama", "Fantasy"],
    rating: 8.7,
    views: 1300000,
    chapterCount: 139,
    updatedAt: "Completed",
    status: "Completed",
  },

  {
    id: "10",
    title: "Naruto",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/117681.jpg",
    slug: "naruto",
    latestChapter: "Chapter 700",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 8.3,
    views: 1500000,
    chapterCount: 700,
    updatedAt: "Completed",
    status: "Completed",
  },

  {
    id: "12",
    title: "Bleach",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/180031.jpg",
    slug: "bleach",
    latestChapter: "Chapter 686",
    genres: ["Action", "Adventure", "Supernatural"],
    rating: 8.0,
    views: 1200000,
    chapterCount: 686,
    updatedAt: "Completed",
    status: "Completed",
  },
  {
    id: "14",
    title: "Hunter x Hunter",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/253119.jpg",
    slug: "hunter-x-hunter",
    latestChapter: "Chapter 400",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 9.1,
    views: 1050000,
    chapterCount: 400,
    updatedAt: "6ヶ月前",
    status: "連載中",
  },
  {
    id: "15",
    title: "Fullmetal Alchemist",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/243675.jpg",
    slug: "fullmetal-alchemist",
    latestChapter: "Chapter 116",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 9.0,
    views: 950000,
    chapterCount: 116,
    updatedAt: "Completed",
    status: "Completed",
  },
  {
    id: "16",
    title: "Black Clover",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/166124.jpg",
    slug: "black-clover",
    latestChapter: "Chapter 367",
    genres: ["Action", "Fantasy", "Comedy"],
    rating: 8.2,
    views: 820000,
    chapterCount: 367,
    updatedAt: "1週間前",
    status: "連載中",
  },
  {
    id: "17",
    title: "Dr. Stone",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/200509.jpg",
    slug: "dr-stone",
    latestChapter: "Chapter 232",
    genres: ["Adventure", "Sci-Fi", "Comedy"],
    rating: 8.6,
    views: 750000,
    chapterCount: 232,
    updatedAt: "Completed",
    status: "Completed",
  },
  {
    id: "18",
    title: "The Promised Neverland",
    coverImage: "https://cdn.myanimelist.net/images/manga/3/186922.jpg",
    slug: "the-promised-neverland",
    latestChapter: "Chapter 181",
    genres: ["Mystery", "Horror", "Sci-Fi"],
    rating: 8.5,
    views: 720000,
    chapterCount: 181,
    updatedAt: "Completed",
    status: "Completed",
  },
  {
    id: "19",
    title: "Vinland Saga",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/188925.jpg",
    slug: "vinland-saga",
    latestChapter: "Chapter 208",
    genres: ["Action", "Adventure", "Historical"],
    rating: 9.0,
    views: 680000,
    chapterCount: 208,
    updatedAt: "2週間前",
    status: "連載中",
  },
  {
    id: "20",
    title: "Kingdom",
    coverImage: "https://cdn.myanimelist.net/images/manga/2/171872.jpg",
    slug: "kingdom",
    latestChapter: "Chapter 756",
    genres: ["Action", "Historical", "Military"],
    rating: 9.2,
    views: 650000,
    chapterCount: 756,
    updatedAt: "3 days ago",
    status: "Ongoing",
  },
];

// Filter manga by status
const ongoingManga = mangaData.filter(manga => manga.status === "Ongoing");
const completedManga = mangaData.filter(manga => manga.status === "Completed");

// Sort by views for popular
const popularManga = [...mangaData].sort((a, b) => b.views - a.views);

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Main Grid Layout */}
      <section>
        <Tabs defaultValue="latest" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background border border-border/40">
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/manga">View More</Link>
            </Button>
          </div>

          <TabsContent value="latest" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mangaData.map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {popularManga.map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {completedManga.map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

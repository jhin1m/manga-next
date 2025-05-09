import Image from "next/image";
import Link from "next/link";
import MangaCard from "@/components/feature/MangaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Mock data for demonstration
const featuredManga = [
  {
    id: "1",
    title: "One Piece",
    coverImage: "https://placehold.co/300x450/png",
    slug: "one-piece",
    latestChapter: "Chapter 1089",
    genres: ["Action", "Adventure", "Fantasy"],
  },
  {
    id: "2",
    title: "Jujutsu Kaisen",
    coverImage: "https://placehold.co/300x450/png",
    slug: "jujutsu-kaisen",
    latestChapter: "Chapter 253",
    genres: ["Action", "Supernatural", "Horror"],
  },
  {
    id: "3",
    title: "Chainsaw Man",
    coverImage: "https://placehold.co/300x450/png",
    slug: "chainsaw-man",
    latestChapter: "Chapter 156",
    genres: ["Action", "Horror", "Supernatural"],
  },
  {
    id: "4",
    title: "My Hero Academia",
    coverImage: "https://placehold.co/300x450/png",
    slug: "my-hero-academia",
    latestChapter: "Chapter 420",
    genres: ["Action", "Superhero", "School"],
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary/80 to-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Ultimate Manga Reading Experience
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
            Discover thousands of manga titles, stay updated with the latest chapters, and enjoy a seamless reading experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/manga">Browse Manga</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-background/10 border-background/20" asChild>
              <Link href="/latest">Latest Updates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Manga Carousel */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Manga</h2>
          <Button variant="outline" asChild>
            <Link href="/manga">View All</Link>
          </Button>
        </div>
        <Carousel className="w-full">
          <CarouselContent>
            {featuredManga.map((manga) => (
              <CarouselItem key={manga.id} className="md:basis-1/4 lg:basis-1/4">
                <div className="p-1">
                  <MangaCard {...manga} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Tabbed Content Section */}
      <section>
        <Tabs defaultValue="latest" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="latest">Latest Updates</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Button variant="outline" asChild>
              <Link href="/manga">View All</Link>
            </Button>
          </div>

          <TabsContent value="latest" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredManga.slice().reverse().map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredManga.map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredManga.slice(0, 2).map((manga) => (
                <MangaCard key={manga.id} {...manga} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

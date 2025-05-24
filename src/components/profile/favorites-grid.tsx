'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Eye, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/manga/FavoriteButton'
import { formatDate } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'

interface Chapter {
  id: number
  chapter_number: number
  title: string | null
  slug: string
  release_date: string | null
}

interface Comic {
  id: number
  title: string
  slug: string
  cover_image_url: string | null
  status: string | null
  Chapters: Chapter[]
}

interface Favorite {
  user_id: number
  comic_id: number
  created_at: string | Date
  Comics: Comic
}

interface FavoritesGridProps {
  favorites: Favorite[]
}

export default function FavoritesGrid({ favorites }: FavoritesGridProps) {
  const router = useRouter()
  const [removedIds, setRemovedIds] = useState<number[]>([])

  // Filter out removed favorites
  const visibleFavorites = favorites.filter(fav => !removedIds.includes(fav.comic_id))

  // Handle favorite removal
  const handleFavoriteRemoved = (comicId: number) => {
    setRemovedIds(prev => [...prev, comicId])
    // Refresh the page after a short delay to update the UI
    setTimeout(() => {
      router.refresh()
    }, 300)
  }

  if (visibleFavorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
        <p className="text-muted-foreground mb-6">
          You haven't added any manga to your favorites list.
        </p>
        <Button asChild>
          <Link href="/manga">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Manga
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {visibleFavorites.map((favorite) => {
        const manga = favorite.Comics
        const latestChapter = manga.Chapters && manga.Chapters.length > 0 ? manga.Chapters[0] : null

        return (
          <div key={favorite.comic_id} className="group relative">
            <Card className="overflow-hidden h-full transition-all hover:shadow-md border-border/40 bg-card/50">
              <Link href={`/manga/${manga.slug}`} className="block">
                <div className="relative w-full h-[280px] overflow-hidden">
                  <Image
                    src={manga.cover_image_url || '/images/placeholder.png'}
                    alt={manga.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Status badge */}
                  {manga.status && (
                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs py-1 px-2 rounded-br">
                      {manga.status}
                    </div>
                  )}

                  {/* Favorite button */}
                  <div
                    className="absolute top-2 right-2 z-10"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <FavoriteButton
                      comicId={manga.id}
                      initialIsFavorite={true}
                      variant="secondary"
                      className="bg-black/50 hover:bg-black/70"
                      onToggleComplete={(result) => {
                        if (result && !result.isFavorite) {
                          handleFavoriteRemoved(manga.id)
                        }
                      }}
                    />
                  </div>
                </div>
              </Link>

              <CardContent className="p-3 space-y-2">
                {/* Title */}
                <Link href={`/manga/${manga.slug}`} className="block">
                  <h3 className="font-bold text-base line-clamp-1 hover:text-primary transition-colors">
                    {manga.title}
                  </h3>
                </Link>

                {/* Latest chapter */}
                {latestChapter && (
                  <div className="flex flex-col space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-1 bg-secondary rounded-full whitespace-nowrap overflow-hidden">
                        <Link
                          href={`/manga/${manga.slug}/${latestChapter.slug}`}
                          className="font-medium hover:text-primary transition-colors block truncate"
                          aria-label={`Read Chapter ${latestChapter.chapter_number}${latestChapter.title ? `: ${latestChapter.title}` : ''}`}
                          title={`Chapter ${latestChapter.chapter_number}${latestChapter.title ? `: ${latestChapter.title}` : ''}`}
                        >
                         ${latestChapter.title}
                        </Link>
                      </div>
                      {latestChapter.release_date && (
                        <span className="text-muted-foreground/80 text-[11px] whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis" title={typeof latestChapter.release_date === 'string' ? formatDate(latestChapter.release_date) : latestChapter.release_date.toLocaleDateString()}>
                          {typeof latestChapter.release_date === 'string' ? formatDate(latestChapter.release_date) : latestChapter.release_date.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

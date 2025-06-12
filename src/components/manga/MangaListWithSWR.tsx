'use client'

import { useState } from 'react'
import { useMangaList } from '@/hooks/swr/useManga'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Removed loading overlay - using instant navigation
import { Badge } from '@/components/ui/badge'
import { Eye, Star, Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatViews } from '@/lib/utils/format'

interface MangaListWithSWRProps {
  initialSort?: string
  initialStatus?: string
  initialGenre?: string
  limit?: number
}

/**
 * Example component demonstrating SWR usage for manga list
 * Shows loading states, error handling, and optimistic updates
 */
export default function MangaListWithSWR({
  initialSort = 'latest',
  limit = 20,
}: MangaListWithSWRProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sort, setSort] = useState(initialSort)

  const {
    manga,
    totalPages,
    currentPage: apiCurrentPage,
    totalComics,
    isLoading,
    error,
    mutate,
  } = useMangaList({
    sort,
    page: currentPage,
    limit,
  })

  // Loading state
  if (isLoading && manga.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading manga list...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load manga: {error.message}</p>
        <Button onClick={() => mutate()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manga Collection</h2>
          <p className="text-muted-foreground">
            {totalComics} manga found • Page {apiCurrentPage} of {totalPages}
          </p>
        </div>

        {/* Sort options */}
        <div className="flex gap-2">
          <Button
            variant={sort === 'latest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSort('latest')
              setCurrentPage(1)
            }}
          >
            Latest
          </Button>
          <Button
            variant={sort === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSort('popular')
              setCurrentPage(1)
            }}
          >
            Popular
          </Button>
          <Button
            variant={sort === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSort('rating')
              setCurrentPage(1)
            }}
          >
            Top Rated
          </Button>
        </div>
      </div>

      {/* Manga grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {manga.map((comic: any) => (
          <Card key={comic.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/manga/${comic.slug}`}>
              <div className="relative aspect-[3/4] bg-muted">
                {comic.cover_image_url ? (
                  <Image
                    src={comic.cover_image_url}
                    alt={comic.title}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
                
                {/* Status badge */}
                {comic.status && (
                  <Badge 
                    className="absolute top-2 right-2" 
                    variant={comic.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {comic.status}
                  </Badge>
                )}
              </div>
            </Link>

            <CardContent className="p-4 space-y-3">
              <Link href={`/manga/${comic.slug}`}>
                <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                  {comic.title}
                </h3>
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(comic.total_views || 0)}</span>
                </div>
                
                {comic.average_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{comic.average_rating}/10</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{formatViews(comic.total_favorites || 0)}</span>
                </div>
              </div>

              {/* Genres */}
              {comic.genres && comic.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {comic.genres.slice(0, 3).map((genre: { name: string; slug: string }) => (
                    <Badge key={genre.slug} variant="outline" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                  {comic.genres.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{comic.genres.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {isLoading && manga.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Manual refresh button */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
    </div>
  )
}

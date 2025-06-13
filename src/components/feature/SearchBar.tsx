'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, BookOpen, Clock, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchApi, mangaApi } from '@/lib/api/client';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// Types for search results
interface MangaSearchResult {
  id: number;
  title: string;
  slug: string;
  cover_image_url?: string;
  description?: string;
  Comic_Genres?: { Genres: { name: string } }[];
  Chapters?: { title?: string; chapter_number: number; slug: string }[];
}

// Utility functions for localStorage
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (term: string) => {
  if (typeof window === 'undefined') return;
  try {
    const searches = getRecentSearches();
    const filteredSearches = searches.filter(s => s !== term);
    const newSearches = [term, ...filteredSearches].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

const removeRecentSearch = (term: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const searches = getRecentSearches();
    const newSearches = searches.filter(s => s !== term);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    return newSearches;
  } catch {
    return getRecentSearches();
  }
};

// Desktop search button that matches the style of navigation links
export function DesktopSearchButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('navigation');

  // Add keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <button
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span>{t('search')}</span>
      </button>
      <SearchBar open={open} setOpen={setOpen} />
    </>
  );
}

// Mobile search button with icon only
export function SearchButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('navigation');

  // Add keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">{t('searchManga')}</span>
      </Button>
      <SearchBar open={open} setOpen={setOpen} />
    </>
  );
}

interface SearchBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}

export default function SearchBar({ open, setOpen, className }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [liveResults, setLiveResults] = useState<MangaSearchResult[]>([]);
  const [popularManga, setPopularManga] = useState<MangaSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');

  // Fetch popular manga - OPTIMIZED with better error handling and caching
  const fetchPopularManga = useCallback(async () => {
    // Avoid duplicate calls
    if (isLoadingPopular || popularManga.length > 0) return;

    setIsLoadingPopular(true);
    try {
      const data = await mangaApi.getList({
        sort: 'popular',
        limit: 5,
      });

      if (data?.comics && Array.isArray(data.comics) && data.comics.length > 0) {
        const transformedResults = data.comics.map((comic: any) => ({
          id: comic.id,
          title: comic.title || 'Unknown Title',
          slug: comic.slug || '',
          cover_image_url: comic.cover_image_url,
          description: comic.description?.substring(0, 100) + (comic.description?.length > 100 ? '...' : ''),
          Comic_Genres: comic.Comic_Genres || [],
          Chapters: comic.Chapters || []
        }));
        setPopularManga(transformedResults);
      }
    } catch (err) {
      console.error('Error fetching popular manga:', err);
      // Don't show error to user for popular manga, just log it
    } finally {
      setIsLoadingPopular(false);
    }
  }, [isLoadingPopular, popularManga.length]);

  // Load recent searches when component mounts, but delay popular manga loading
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // OPTIMIZED: Lazy load popular manga only when search dialog is opened and no search query
  useEffect(() => {
    if (open && !searchQuery && popularManga.length === 0 && !isLoadingPopular) {
      fetchPopularManga();
    }
  }, [open, searchQuery, fetchPopularManga, isLoadingPopular, popularManga.length]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Debounced search function using centralized API
  const debouncedSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    const hasNonLatinChars = /[^\u0020-\u007F]/.test(trimmedQuery);
    const minQueryLength = hasNonLatinChars ? 1 : 2;

    if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
      setLiveResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLiveResults([]);

    try {
      const data = await searchApi.searchManga({
        q: trimmedQuery,
        limit: 5,
      });

      if (data?.comics && Array.isArray(data.comics) && data.comics.length > 0) {
        const transformedResults = data.comics.slice(0, 5).map((comic: any) => ({
          id: comic.id,
          title: comic.title || 'Unknown Title',
          slug: comic.slug || '',
          cover_image_url: comic.cover_image_url,
          description: comic.description?.substring(0, 100) + (comic.description?.length > 100 ? '...' : ''),
          Comic_Genres: comic.Comic_Genres || [],
          Chapters: comic.Chapters || []
        }));
        setLiveResults(transformedResults);
      } else {
        setLiveResults([]);
      }
    } catch (err) {
      console.error('Error performing live search:', err);
      setError('Failed to fetch search results. Please try again.');
      setLiveResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search query changes with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  // Handle search navigation
  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/manga/${slug}`);
    setSearchQuery('');
    setLiveResults([]);
  };

  // Handle search submission
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setOpen(false);
      saveRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchQuery('');
      setLiveResults([]);
    }
  };

  // Handle removing a recent search
  const handleRemoveRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedSearches = removeRecentSearch(term);
    setRecentSearches(updatedSearches);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Reset results when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setLiveResults([]);
      setError(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
        <DialogTitle className="sr-only">{tSearch('placeholder')}</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-3 h-5 w-5 shrink-0 opacity-50" />
          <Input
            ref={inputRef}
            placeholder={tSearch('placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-none bg-transparent text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Search Results */}
        <div className={cn("max-h-[70vh] overflow-y-auto", className)}>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 px-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">{tSearch('searching')}</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-6 px-4 text-center">
              <p className="text-sm text-red-500 mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => debouncedSearch(searchQuery)}
              >
                {tCommon('tryAgain')}
              </Button>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && searchQuery.length > 0 && liveResults.length === 0 && (
            <div className="py-8 px-4 text-center">
              <p className="text-sm text-muted-foreground">{tSearch('noResults')}</p>
            </div>
          )}

          {/* Live Search Results */}
          {liveResults.length > 0 && !isLoading && (
            <div className="px-4 py-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {tSearch('searchFor')}
              </div>
              <div className="space-y-1">
                {liveResults.map((manga) => (
                  <button
                    key={manga.id}
                    onClick={() => handleSelect(manga.slug)}
                    className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-16 bg-muted rounded-md overflow-hidden relative">
                      {manga.cover_image_url ? (
                        <Image
                          src={manga.cover_image_url}
                          alt={manga.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-semibold text-sm leading-tight line-clamp-2">
                        {manga.title}
                      </div>
                      {manga.Chapters && manga.Chapters.length > 0 && manga.Chapters[0].title && (
                        <Badge variant="secondary" className="text-xs">
                          {manga.Chapters[0].title}
                        </Badge>
                      )}
                      {manga.Comic_Genres && manga.Comic_Genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {manga.Comic_Genres.slice(0, 3).map((cg, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs px-1.5 py-0.5"
                            >
                              {cg.Genres.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {/* Search for query button */}
                {searchQuery.trim().length > 0 && (
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors text-primary"
                  >
                    <Search className="h-5 w-5 flex-shrink-0" />
                    <span>{tSearch('searchFor')} <span className="font-semibold">"{searchQuery}"</span></span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search Button (when no live results yet) */}
          {searchQuery && searchQuery.trim().length > 0 && liveResults.length === 0 && !isLoading && !error && (
            <div className="px-4 py-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {tSearch('searchFor')}
              </div>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors"
              >
                <Search className="h-5 w-5 flex-shrink-0" />
                <span>{tSearch('searchFor')} <span className="font-semibold">"{searchQuery}"</span></span>
              </button>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <div className="px-4 py-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {tSearch('recentSearches')}
              </div>
              <div className="space-y-1">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center group px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <button
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{term}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleRemoveRecentSearch(e, term)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Manga */}
          {!searchQuery && (
            <div className="px-4 py-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {tSearch('popularManga')}
              </div>
              {isLoadingPopular ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">{tCommon('loading')}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {popularManga.map((manga) => (
                    <button
                      key={manga.id}
                      onClick={() => handleSelect(manga.slug)}
                      className="w-full flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-12 h-16 bg-muted rounded-md overflow-hidden relative">
                        {manga.cover_image_url ? (
                          <Image
                            src={manga.cover_image_url}
                            alt={manga.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="font-semibold text-sm leading-tight line-clamp-2">
                          {manga.title}
                        </div>
                        {manga.Chapters && manga.Chapters.length > 0 && manga.Chapters[0].title && (
                          <Badge variant="secondary" className="text-xs">
                            {manga.Chapters[0].title}
                          </Badge>
                        )}
                        {manga.Comic_Genres && manga.Comic_Genres.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {manga.Comic_Genres.slice(0, 3).map((cg, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs px-1.5 py-0.5"
                              >
                                {cg.Genres.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

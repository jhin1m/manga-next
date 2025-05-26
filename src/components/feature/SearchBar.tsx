'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, History, TrendingUp, Sparkles, Clock, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { API_ENDPOINTS } from '@/lib/api/client';

// Types for search results
interface MangaSearchResult {
  id: number;
  title: string;
  slug: string;
  cover_image_url?: string;
  description?: string;
  _highlightedTitle?: string;
  _highlightedDescription?: string;
  genres?: { name: string }[];
  status?: string;
}

// Popular manga suggestions for quick access
const popularManga = [
  { title: 'One Piece', slug: 'one-piece' },
  { title: 'Demon Slayer', slug: 'demon-slayer' },
  { title: 'Jujutsu Kaisen', slug: 'jujutsu-kaisen' },
  { title: 'My Hero Academia', slug: 'my-hero-academia' },
  { title: 'Tokyo Revengers', slug: 'tokyo-revengers' },
];

// Get recent searches from localStorage
const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Failed to parse recent searches:', error);
    return [];
  }
};

// Save a search term to localStorage
const saveRecentSearch = (term: string) => {
  if (typeof window === 'undefined') return;

  try {
    const searches = getRecentSearches();
    // Remove the term if it already exists to avoid duplicates
    const filteredSearches = searches.filter(s => s !== term);
    // Add the new term at the beginning and limit to 5 items
    const newSearches = [term, ...filteredSearches].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};

// Remove a search term from localStorage
const removeRecentSearch = (term: string): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const searches = getRecentSearches();
    const newSearches = searches.filter(s => s !== term);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    return newSearches;
  } catch (error) {
    console.error('Failed to remove recent search:', error);
    return getRecentSearches();
  }
};

// Desktop search button that matches the style of navigation links
export function DesktopSearchButton() {
  const [open, setOpen] = useState(false);

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
        <span>Search</span>
      </button>
      <SearchBar open={open} setOpen={setOpen} />
    </>
  );
}

// Mobile search button with icon only
export function SearchButton() {
  const [open, setOpen] = useState(false);

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
        <span className="sr-only">Search manga</span>
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches when component mounts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    // Check if the query is valid
    const trimmedQuery = query.trim();

    // For Japanese characters, we need to be more lenient with the minimum length
    // Check if the query contains non-Latin characters
    const hasNonLatinChars = /[^\u0020-\u007F]/.test(trimmedQuery);

    // For non-Latin characters like Japanese, even a single character can be meaningful
    const minQueryLength = hasNonLatinChars ? 1 : 2;

    if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
      setLiveResults([]);
      setIsLoading(false);
      return;
    }

    // Sanitize query to remove special characters that might cause issues with the search API
    const sanitizedQuery = trimmedQuery.replace(/[&|!:*()[\]{}^~?\\]/g, '');

    setIsLoading(true);
    setError(null);
    setLiveResults([]); // Clear previous results while loading

    try {
      // Use centralized API endpoint configuration
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/search?q=${encodeURIComponent(sanitizedQuery)}&limit=5&sort=relevance`;
      console.log(`Searching for: ${sanitizedQuery} (API URL: ${apiUrl})`);

      // Sử dụng cache: 'no-store' để đảm bảo luôn lấy dữ liệu mới nhất
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Search results:`, data);

      // Check if we have results
      if (!data || !data.comics || !Array.isArray(data.comics) || data.comics.length === 0) {
        console.log('No results found for query:', sanitizedQuery);
        setLiveResults([]);
      } else {
        console.log(`Comics array length: ${data.comics.length}`);

        try {
          // Transform the results to include highlighted content
          const transformedResults = data.comics.slice(0, 5).map((comic: any) => {
            if (!comic || typeof comic !== 'object') {
              console.error('Invalid comic object:', comic);
              return null;
            }

            // Create a clean object with only the properties we need
            const result: MangaSearchResult = {
              id: comic.id,
              title: comic.title || 'Unknown Title',
              slug: comic.slug || '',
              cover_image_url: comic.cover_image_url || undefined,
              description: comic.description ?
                (comic.description.substring(0, 100) + (comic.description.length > 100 ? '...' : '')) :
                undefined,
              _highlightedTitle: comic._highlightedTitle || comic.title || 'Unknown Title',
              _highlightedDescription: comic._highlightedDescription ||
                (comic.description ?
                  (comic.description.substring(0, 100) + (comic.description.length > 100 ? '...' : '')) :
                  undefined),
              genres: Array.isArray(comic.Comic_Genres) ?
                comic.Comic_Genres
                  .map((cg: any) => cg.Genres)
                  .filter(Boolean) :
                [],
              status: comic.status || 'unknown'
            };

            return result;
          }).filter(Boolean) as MangaSearchResult[];

          console.log('Transformed results:', transformedResults);

          // Update state with the transformed results
          if (transformedResults && transformedResults.length > 0) {
            setLiveResults(transformedResults);
            console.log('Updated liveResults state with', transformedResults.length, 'items');
          } else {
            setLiveResults([]);
            console.log('No valid results after transformation');
          }
        } catch (transformError) {
          console.error('Error transforming search results:', transformError);
          setError('Error processing search results');
          setLiveResults([]);
        }
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
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debouncing (300ms)
    debounceTimerRef.current = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  // Handle search navigation
  const handleSelect = (value: string) => {
    console.log('handleSelect called with value:', value);
    setOpen(false);

    if (value.startsWith('manga:')) {
      const slug = value.replace('manga:', '');
      console.log('Navigating to manga:', slug);
      router.push(`/manga/${slug}`);
    } else {
      // Save search term and navigate
      if (value.trim()) {
        console.log('Navigating to search results for:', value);
        saveRecentSearch(value);
        setRecentSearches(getRecentSearches());
        router.push(`/search?q=${encodeURIComponent(value)}`);
      }
    }

    setSearchQuery('');
    setLiveResults([]);
  };

  // Handle removing a recent search
  const handleRemoveRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updatedSearches = removeRecentSearch(term);
    setRecentSearches(updatedSearches);
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
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search Manga"
    >
      <CommandInput
        placeholder="Search manga..."
        value={searchQuery}
        onValueChange={setSearchQuery}
        className="border-none focus:ring-0"
        autoFocus
      />
      <CommandList className={`overflow-y-auto max-h-[80vh] ${className}`} role="listbox">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Searching...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="px-4 py-3 text-sm text-red-500">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => debouncedSearch(searchQuery)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* CommandEmpty sẽ tự động hiển thị khi không có CommandItem nào được render */}
        {liveResults.length === 0 && !isLoading && (
          <CommandEmpty className="py-6 text-center text-sm">
            {searchQuery.length > 0 ? 'No results found.' : 'Type to search...'}
          </CommandEmpty>
        )}

        {/* Live Search Results */}
        {liveResults.length > 0 && !isLoading && (
          <CommandGroup heading="Search Results" className="z-50">
            {liveResults.map((manga) => (
              <div
                key={manga.id}
                className="relative flex flex-col items-start gap-2 py-4 px-3 cursor-pointer hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 min-h-[80px] rounded-md select-none outline-none"
                role="option"
                aria-label={`Navigate to ${manga.title}`}
                onClick={() => {
                  console.log('Clicked on manga:', manga.title);
                  handleSelect(`manga:${manga.slug}`);
                }}
                onMouseDown={() => {
                  console.log('Mouse down on manga:', manga.title);
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 w-12 h-16 bg-muted rounded-md overflow-hidden shadow-sm border">
                    {manga.cover_image_url ? (
                      <img
                        src={manga.cover_image_url}
                        alt={`Cover of ${manga.title}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    {manga._highlightedTitle ? (
                      <div
                        className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors"
                        dangerouslySetInnerHTML={{ __html: manga._highlightedTitle }}
                      />
                    ) : (
                      <div className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {manga.title}
                      </div>
                    )}

                    {manga.status && (
                      <div className="text-sm text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">
                          {manga.status}
                        </span>
                      </div>
                    )}

                    {manga.genres && manga.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {manga.genres.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary"
                          >
                            {genre.name}
                          </span>
                        ))}
                        {manga.genres.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{manga.genres.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {manga._highlightedDescription && (
                  <div
                    className="text-sm text-muted-foreground line-clamp-2 pl-[60px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: manga._highlightedDescription }}
                  />
                )}
              </div>
            ))}
            {searchQuery.trim().length > 0 && (
              <CommandItem
                onSelect={() => handleSelect(searchQuery)}
                className="flex items-center gap-3 py-3 px-3 text-primary cursor-pointer hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
                value={`view-all-${searchQuery}`}
                role="option"
                aria-label={`View all search results for ${searchQuery}`}
              >
                <Search className="h-5 w-5 flex-shrink-0" />
                <span className="text-base">
                  View all results for <span className="font-semibold">{searchQuery}</span>
                </span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        {/* Debug info - Hiển thị thông tin debug để kiểm tra trạng thái */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-t">
            <div>Query: {searchQuery}</div>
            <div>Results: {liveResults.length}</div>
            <div>Loading: {isLoading ? 'true' : 'false'}</div>
            <div>Error: {error ? error : 'none'}</div>
          </div>
        )}

        {/* Search Button (when no live results yet) */}
        {searchQuery && searchQuery.trim().length > 0 && liveResults.length === 0 && !isLoading && !error && (
          <CommandGroup heading="Search" className="z-50">
            <CommandItem
              onSelect={() => handleSelect(searchQuery)}
              className="flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
              value={`search-for-${searchQuery}`}
              role="option"
              aria-label={`Search for ${searchQuery}`}
            >
              <Search className="h-5 w-5 flex-shrink-0" />
              <span className="text-base">Search for <span className="font-semibold">{searchQuery}</span></span>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <>
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  onSelect={() => handleSelect(term)}
                  className="flex items-center gap-3 justify-between group py-3 px-3 hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
                  role="option"
                  aria-label={`Search for ${term}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-base">{term}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleRemoveRecentSearch(e, term)}
                    aria-label={`Remove ${term} from recent searches`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Popular Manga">
          {popularManga.map((manga) => (
            <CommandItem
              key={manga.slug}
              onSelect={() => handleSelect(`manga:${manga.slug}`)}
              className="flex items-center gap-3 py-3 px-3 hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
              role="option"
              aria-label={`Navigate to ${manga.title}`}
            >
              <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-base">{manga.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Links">
          <CommandItem
            onSelect={() => router.push('/manga')}
            className="flex items-center gap-3 py-3 px-3 hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
            role="option"
            aria-label="Browse latest manga"
          >
            <Sparkles className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-base">Latest Manga</span>
          </CommandItem>
          <CommandItem
            onSelect={() => router.push('/popular')}
            className="flex items-center gap-3 py-3 px-3 hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
            role="option"
            aria-label="Browse popular manga"
          >
            <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-base">Popular Manga</span>
          </CommandItem>
          <CommandItem
            onSelect={() => router.push('/history')}
            className="flex items-center gap-3 py-3 px-3 hover:bg-accent/50 focus:bg-accent/50 transition-colors duration-200 rounded-md"
            role="option"
            aria-label="View reading history"
          >
            <History className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-base">Reading History</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Keyboard Shortcuts">
          <CommandItem className="flex justify-between py-3 px-3 rounded-md" role="option" tabIndex={-1}>
            <span className="text-base">Open Search</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem className="flex justify-between py-3 px-3 rounded-md" role="option" tabIndex={-1}>
            <span className="text-base">Close</span>
            <CommandShortcut>ESC</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

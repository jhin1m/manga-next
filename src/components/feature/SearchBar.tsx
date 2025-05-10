'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, History, TrendingUp, Sparkles, Clock, X } from 'lucide-react';
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
}

export default function SearchBar({ open, setOpen }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches when component mounts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Handle search navigation
  const handleSelect = (value: string) => {
    setOpen(false);

    if (value.startsWith('manga:')) {
      const slug = value.replace('manga:', '');
      router.push(`/manga/${slug}`);
    } else {
      // Save search term and navigate
      if (value.trim()) {
        saveRecentSearch(value);
        setRecentSearches(getRecentSearches());
        router.push(`/search?q=${encodeURIComponent(value)}`);
      }
    }

    setSearchQuery('');
  };

  // Handle removing a recent search
  const handleRemoveRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updatedSearches = removeRecentSearch(term);
    setRecentSearches(updatedSearches);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search Manga">
      <CommandInput
        placeholder="Search manga..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {searchQuery && (
          <CommandGroup heading="Search">
            <CommandItem
              onSelect={() => handleSelect(searchQuery)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search for <span className="font-medium">{searchQuery}</span></span>
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
                  className="flex items-center gap-2 justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{term}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleRemoveRecentSearch(e, term)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
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
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>{manga.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Links">
          <CommandItem onSelect={() => router.push('/manga')} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Latest Manga</span>
          </CommandItem>
          <CommandItem onSelect={() => router.push('/popular')} className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Popular Manga</span>
          </CommandItem>
          <CommandItem onSelect={() => router.push('/history')} className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Reading History</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Keyboard Shortcuts">
          <CommandItem className="flex justify-between">
            <span>Open Search</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem className="flex justify-between">
            <span>Close</span>
            <CommandShortcut>ESC</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

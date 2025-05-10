'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Mock genres for demonstration
const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
];

// Mock status options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' }
];

// Sort options
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest Update' },
  { value: 'newest', label: 'Newest Added' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rating' }
];

interface FilterSortBarProps {
  className?: string;
}

export default function FilterSortBar({ className }: FilterSortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get current filter values from URL
  const currentSort = searchParams.get('sort') || 'latest';
  const currentStatus = searchParams.get('status') || 'all';
  const currentGenres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  
  // Local state for filter values
  const [sort, setSort] = useState(currentSort);
  const [status, setStatus] = useState(currentStatus);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentGenres);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Update URL when sort changes
  const handleSortChange = (value: string) => {
    setSort(value);
    updateFilters({ sort: value });
  };
  
  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  
  // Apply filters
  const applyFilters = () => {
    updateFilters({
      status,
      genres: selectedGenres.length > 0 ? selectedGenres.join(',') : null
    });
    setIsFilterOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStatus('all');
    setSelectedGenres([]);
  };
  
  // Update URL with filters
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove each parameter
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Navigate to the new URL
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Count active filters
  const activeFilterCount = [
    status !== 'all' ? 1 : 0,
    selectedGenres.length
  ].reduce((a, b) => a + b, 0);
  
  return (
    <div className={`flex flex-wrap gap-2 items-center justify-between ${className}`}>
      {/* Sort Dropdown */}
      <div className="flex-1 min-w-[200px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort: {SORT_OPTIONS.find(option => option.value === sort)?.label}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="flex flex-col">
              {SORT_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={sort === option.value ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Filter Button and Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Manga</SheetTitle>
            <SheetDescription>
              Apply filters to find specific manga
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 flex flex-col gap-6">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Genres Filter */}
            <div className="space-y-2">
              <Label>Genres</Label>
              <div className="grid grid-cols-2 gap-2">
                {GENRES.map(genre => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`genre-${genre}`}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => toggleGenre(genre)}
                    />
                    <label
                      htmlFor={`genre-${genre}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <SheetClose asChild>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

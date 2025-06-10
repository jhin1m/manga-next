"use client";

import { useState, useEffect } from 'react';
import FilterSortBar from '@/components/feature/FilterSortBar';
import { FilterSortBarSkeleton } from '@/components/ui/skeletons/MangaListSkeleton';

interface FilterSortBarClientProps {
  showLoadingEffect?: boolean;
  loadingDelay?: number;
}

export default function FilterSortBarClient({ 
  showLoadingEffect = true,
  loadingDelay = 200
}: FilterSortBarClientProps) {
  const [isLoading, setIsLoading] = useState(showLoadingEffect);

  useEffect(() => {
    if (showLoadingEffect) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, loadingDelay);

      return () => clearTimeout(timeout);
    }
  }, [showLoadingEffect, loadingDelay]);

  if (isLoading) {
    return <FilterSortBarSkeleton />;
  }

  return <FilterSortBar />;
}

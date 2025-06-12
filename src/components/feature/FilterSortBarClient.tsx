"use client";

import { useState, useEffect } from 'react';
import FilterSortBar from '@/components/feature/FilterSortBar';
// Removed loading overlay - using instant navigation

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
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm">Loading filters...</span>
        </div>
      </div>
    );
  }

  return <FilterSortBar />;
}

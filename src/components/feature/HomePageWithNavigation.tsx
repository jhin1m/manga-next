'use client';

import { useNavigationLoading } from '@/hooks/useNavigationLoading';
// Removed loading overlay - using instant navigation
import ProgressiveHomePage from './ProgressiveHomePage';

interface HomePageWithNavigationProps {
  initialData: {
    hotManga: any[];
    latestManga: any[];
    latestMangaPagination: {
      totalPages: number;
      currentPage: number;
      totalResults: number;
    };
    sidebarData: {
      rankings: any[];
      recentComments: any[];
      recommendedManga: any[];
    };
  };
}

export default function HomePageWithNavigation({ initialData }: HomePageWithNavigationProps) {
  const { isLoading } = useNavigationLoading();

  // Nếu đang loading navigation, hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading homepage...</span>
        </div>
      </div>
    );
  }

  // Ngược lại hiển thị progressive homepage
  return <ProgressiveHomePage initialData={initialData} />;
}

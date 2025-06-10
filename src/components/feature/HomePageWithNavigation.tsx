'use client';

import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { HomePageSkeleton } from '@/components/ui/skeletons/HomePageSkeleton';
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

  // Nếu đang loading navigation, hiển thị skeleton
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  // Ngược lại hiển thị progressive homepage
  return <ProgressiveHomePage initialData={initialData} />;
}

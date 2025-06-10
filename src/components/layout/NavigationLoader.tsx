'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { HomePageSkeleton } from '@/components/ui/skeletons/HomePageSkeleton';

interface NavigationLoaderProps {
  children: React.ReactNode;
}

export default function NavigationLoader({ children }: NavigationLoaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState<string>('');

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    
    // Nếu đang ở trang chủ và nhấp vào trang chủ
    if (pathname === '/' && previousPath === pathname) {
      setIsLoading(true);
      
      // Hiển thị loading trong thời gian ngắn để tạo hiệu ứng
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Cập nhật previous path
    setPreviousPath(currentPath);
  }, [pathname, searchParams, previousPath]);

  // Nếu đang loading và là trang chủ, hiển thị skeleton
  if (isLoading && pathname === '/') {
    return <HomePageSkeleton />;
  }

  return <>{children}</>;
}

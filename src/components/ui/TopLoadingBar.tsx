'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TopLoadingBarProps {
  height?: number;
  speed?: number;
  className?: string;
}

export default function TopLoadingBar({
  height = 3,
  speed = 200,
  className = '',
}: TopLoadingBarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isLoading) {
      // Bắt đầu loading với progress tăng dần
      setProgress(0);
      
      timeout = setTimeout(() => {
        setProgress(20);
      }, 50);

      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, speed);
    } else {
      // Hoàn thành loading
      setProgress(100);
      timeout = setTimeout(() => {
        setProgress(0);
      }, 300);
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isLoading, speed]);

  // Lắng nghe thay đổi pathname để kết thúc loading
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Hàm để bắt đầu loading (sẽ được gọi từ bên ngoài)
  const startLoading = () => {
    setIsLoading(true);
  };

  // Expose startLoading function globally
  useEffect(() => {
    (window as any).startTopLoading = startLoading;
    
    return () => {
      delete (window as any).startTopLoading;
    };
  }, []);

  if (progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 z-[9999] transition-all duration-300 ease-out bg-primary shadow-lg ${className}`}
      style={{
        width: `${progress}%`,
        height: `${height}px`,
      }}
    />
  );
}

// Hook để sử dụng loading bar
export function useTopLoadingBar() {
  const startLoading = () => {
    if (typeof window !== 'undefined' && (window as any).startTopLoading) {
      (window as any).startTopLoading();
    }
  };

  return { startLoading };
}

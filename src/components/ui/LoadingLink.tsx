'use client';

import Link from 'next/link';
import { useTopLoadingBar } from './TopLoadingBar';
import { ComponentProps, MouseEvent } from 'react';

interface LoadingLinkProps extends ComponentProps<typeof Link> {
  children: React.ReactNode;
  className?: string;
}

export default function LoadingLink({ 
  href, 
  children, 
  onClick, 
  className,
  ...props 
}: LoadingLinkProps) {
  const { startLoading } = useTopLoadingBar();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Chỉ trigger loading cho manga và chapter links
    const hrefString = href.toString();
    if (hrefString.includes('/manga/')) {
      startLoading();
    }
    
    // Gọi onClick handler gốc nếu có
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

interface HomeLinkProps {
  children: React.ReactNode;
  className?: string;
}

export default function HomeLink({ children, className }: HomeLinkProps) {
  const pathname = usePathname();
  const { triggerLoading } = useNavigationLoading();

  const handleClick = (e: React.MouseEvent) => {
    // Nếu đang ở trang chủ và click vào home link
    if (pathname === '/') {
      e.preventDefault();
      triggerLoading();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link
      href="/"
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

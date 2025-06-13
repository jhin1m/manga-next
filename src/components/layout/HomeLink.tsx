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
  const { triggerHomeLoading } = useNavigationLoading();

  const handleClick = (e: React.MouseEvent) => {
    // Always prevent default and use our loading system
    e.preventDefault();

    if (pathname === '/') {
      // If already on homepage, just scroll to top with loading effect
      triggerHomeLoading();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to homepage with full-screen loading
      triggerHomeLoading();
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

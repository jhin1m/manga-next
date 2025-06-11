import { ReactNode } from 'react';

interface MangaLayoutProps {
  children: ReactNode;
}

export default function MangaLayout({ children }: MangaLayoutProps) {
  return children;
}

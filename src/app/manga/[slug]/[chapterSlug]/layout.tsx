import { ReactNode } from 'react';

interface ChapterLayoutProps {
  children: ReactNode;
}

export default function ChapterLayout({ children }: ChapterLayoutProps) {
  return <>{children}</>;
}

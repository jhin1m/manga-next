'use client';

import { useTranslations } from "next-intl";
import Link from "next/link";

// SVG Icon với animation
const ViewMoreIcon = () => (
  <svg 
    className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M13 7l5 5m0 0l-5 5m5-5H6" 
    />
  </svg>
);

interface ViewMoreButtonProps {
  href: string;
  className?: string;
}

export default function ViewMoreButton({ href, className = "" }: ViewMoreButtonProps) {
  const t = useTranslations('manga');

  return (
    <div className="flex justify-center mt-8">
      <Link 
        href={href} 
        className={`group w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-md text-center transition-all duration-300 flex items-center justify-center hover:shadow-lg hover:scale-[1.02] ${className}`}
      >
        {t('viewMoreManga')}
        <ViewMoreIcon />
      </Link>
    </div>
  );
}

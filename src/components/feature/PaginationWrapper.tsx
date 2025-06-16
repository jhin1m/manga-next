'use client';

import { useRouter } from 'next/navigation';
import { ChevronFirst, ChevronLast } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationWrapperProps) {
  const router = useRouter();

  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Fix URL construction - ensure we use ? or & appropriately
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  // Navigate without page reload and scroll to top
  const handleNavigate = (page: number) => {
    if (page === currentPage) return;
    router.push(getPageUrl(page), { scroll: false });

    // Scroll to top of the page with smooth animation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100); // Slight delay to ensure navigation has processed
  };

  // Determine which page numbers to show
  const getVisiblePages = () => {
    // For small number of pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // For larger number of pages, show a window around current page
    let pages = [1]; // Always include first page

    // Middle section
    if (currentPage <= 3) {
      // Near the start
      pages = [...pages, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pages = [...pages, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    } else {
      // Middle
      pages = [...pages, currentPage - 1, currentPage, currentPage + 1];
    }

    // Add last page if not already included
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Render pagination items with ellipsis
  const renderPaginationItems = () => {
    const items = [];

    for (let i = 0; i < visiblePages.length; i++) {
      const pageNum = visiblePages[i];

      // Add ellipsis if there's a gap
      if (i > 0 && visiblePages[i] - visiblePages[i - 1] > 1) {
        items.push(
          <PaginationItem key={`ellipsis-${i}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Add the page number
      items.push(
        <PaginationItem key={pageNum}>
          <PaginationLink
            onClick={() => handleNavigate(pageNum)}
            isActive={pageNum === currentPage}
            className='cursor-pointer'
          >
            {pageNum}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Pagination className='my-8'>
      <PaginationContent>
        {/* First page button */}
        <PaginationItem>
          <PaginationLink
            onClick={() => currentPage > 1 && handleNavigate(1)}
            className={`cursor-pointer ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            <ChevronFirst className='h-4 w-4' />
          </PaginationLink>
        </PaginationItem>

        {/* Previous page button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && handleNavigate(currentPage - 1)}
            className={`cursor-pointer ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          />
        </PaginationItem>

        {/* Page numbers with ellipsis */}
        {renderPaginationItems()}

        {/* Next page button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && handleNavigate(currentPage + 1)}
            className={`cursor-pointer ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          />
        </PaginationItem>

        {/* Last page button */}
        <PaginationItem>
          <PaginationLink
            onClick={() => currentPage < totalPages && handleNavigate(totalPages)}
            className={`cursor-pointer ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            <ChevronLast className='h-4 w-4' />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

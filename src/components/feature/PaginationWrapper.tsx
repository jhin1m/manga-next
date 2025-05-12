"use client"

import Link from "next/link"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface PaginationWrapperProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

export default function PaginationWrapper({ currentPage, totalPages, baseUrl }: PaginationWrapperProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={currentPage > 1 ? `${baseUrl}&page=${currentPage - 1}` : '#'}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show pages around current page
          let pageNum = currentPage - 2 + i;
          
          // Adjust if we're at the start or end
          if (currentPage < 3) {
            pageNum = i + 1;
          } else if (currentPage > totalPages - 2) {
            pageNum = totalPages - 4 + i;
          }
          
          // Ensure page number is valid
          if (pageNum > 0 && pageNum <= totalPages) {
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  href={`${baseUrl}&page=${pageNum}`}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          }
          return null;
        })}
        
        <PaginationItem>
          <PaginationNext 
            href={currentPage < totalPages ? `${baseUrl}&page=${currentPage + 1}` : '#'}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

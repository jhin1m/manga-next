'use client';

import React, { memo } from 'react';
import Image from 'next/image';

interface ImageLoadState {
  loaded: boolean;
  loading: boolean;
  error: boolean;
  inView: boolean;
}

interface ReaderImageProps {
  src: string;
  alt: string;
  index: number;
  imageState: ImageLoadState;
  placeholderHeight: number;
  onRetry: (index: number, src: string) => void;
  onRef: (index: number, element: HTMLElement | null) => void;
}

/**
 * Optimized image component for manga reader
 * Uses Next/Image for optimization and handles loading states
 */
const ReaderImage: React.FC<ReaderImageProps> = memo(({
  src,
  alt,
  index,
  imageState,
  placeholderHeight,
  onRetry,
  onRef,
}) => {
  const handleRef = (element: HTMLDivElement | null) => {
    onRef(index, element);
  };

  const handleRetry = () => {
    onRetry(index, src);
  };

  return (
    <div
      ref={handleRef}
      className="w-full"
      data-index={index}
    >
      {imageState.loaded ? (
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={placeholderHeight}
          className="w-full h-auto"
          priority={index < 3} // Prioritize first 3 images
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1024px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      ) : imageState.error ? (
        <div
          className="flex flex-col items-center justify-center w-full bg-gray-900/50 text-white/70"
          style={{ height: `${placeholderHeight}px` }}
        >
          {/* Error SVG Icon */}
          <svg 
            className="h-8 w-8 mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-sm mb-2">Failed to load</span>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div
          className="flex items-center justify-center w-full bg-gray-900/30"
          style={{ height: `${placeholderHeight}px` }}
        >
          {/* Loading SVG Icon */}
          <svg 
            className="h-8 w-8 text-white/50 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

ReaderImage.displayName = 'ReaderImage';

export default ReaderImage;

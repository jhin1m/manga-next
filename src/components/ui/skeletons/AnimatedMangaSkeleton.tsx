"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnimatedMangaDetailSkeleton() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const steps = [
      { delay: 0, step: 0 },     // Cover image
      { delay: 200, step: 1 },   // Title
      { delay: 400, step: 2 },   // Action buttons
      { delay: 600, step: 3 },   // Metadata
      { delay: 800, step: 4 },   // Description
    ];

    const timeouts = steps.map(({ delay, step }) =>
      setTimeout(() => setCurrentStep(step), delay)
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Background skeleton */}
      <div className="absolute inset-0 z-0">
        <Skeleton className="w-full h-full" />
      </div>

      <Card className="relative z-10 bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {/* Left Column - Cover + Title + Actions */}
            <div className="col-span-1 lg:col-span-3">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Cover Image Skeleton with animation */}
                <div className="aspect-[2/3] w-40 xs:w-48 sm:w-56 lg:w-64 mx-auto sm:mx-0 flex-shrink-0">
                  <Skeleton 
                    className={`w-full h-full rounded-xl transition-all duration-500 ${
                      currentStep >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`} 
                  />
                </div>

                {/* Title + Action Buttons Skeleton */}
                <div className="flex-1 flex flex-col text-center sm:text-left space-y-3 sm:space-y-4">
                  {/* Status Label Skeleton */}
                  <div className="hidden lg:block">
                    <Skeleton 
                      className={`h-4 w-20 transition-all duration-500 delay-100 ${
                        currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`} 
                    />
                  </div>

                  {/* Title Section Skeleton */}
                  <div className={`transition-all duration-500 delay-200 ${
                    currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <Skeleton className="h-8 sm:h-10 lg:h-12 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className={`flex flex-col xs:flex-row lg:flex-row gap-2 sm:gap-3 transition-all duration-500 delay-300 ${
                    currentStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <Skeleton className="h-10 flex-1 lg:flex-none lg:w-32" />
                    <Skeleton className="h-10 flex-1 lg:flex-none lg:w-32" />
                    <Skeleton className="h-10 flex-1 lg:flex-none lg:w-32" />
                  </div>

                  {/* Stats Skeleton - Desktop only */}
                  <div className={`hidden lg:block transition-all duration-500 delay-400 ${
                    currentStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <div className="flex items-center gap-4 lg:gap-6">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-18" />
                    </div>
                  </div>

                  {/* Description Skeleton - Desktop */}
                  <div className={`hidden lg:block transition-all duration-500 delay-500 ${
                    currentStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <Skeleton className="h-6 w-24 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Metadata Skeleton */}
            <div className={`col-span-1 lg:col-span-1 space-y-3 sm:space-y-4 mt-4 sm:mt-12 transition-all duration-500 delay-600 ${
              currentStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              {/* Description Skeleton - Mobile/Tablet only */}
              <div className="lg:hidden">
                <Skeleton className="h-6 w-24 mb-2 mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </div>

              {/* Details Header Skeleton - Mobile/Tablet only */}
              <div className="lg:hidden">
                <Skeleton className="h-8 w-full" />
              </div>

              {/* Genres Skeleton */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center lg:justify-start">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className={`h-6 w-16 transition-all duration-300 ${
                      currentStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: `${700 + i * 100}ms` }}
                  />
                ))}
              </div>

              {/* Stats Skeleton - Mobile/Tablet */}
              <div className="lg:hidden flex items-center justify-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-10" />
              </div>

              {/* Metadata Skeleton */}
              <div className="space-y-1.5 sm:space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-center lg:justify-start">
                    <Skeleton 
                      className={`h-4 w-32 transition-all duration-300 ${
                        currentStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                      }`}
                      style={{ transitionDelay: `${800 + i * 50}ms` }}
                    />
                  </div>
                ))}
              </div>

              {/* Star Rating Skeleton */}
              <div className="flex justify-center lg:justify-start py-1">
                <Skeleton 
                  className={`h-8 w-40 transition-all duration-500 delay-1000 ${
                    currentStep >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function AnimatedChapterListSkeleton() {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowItems(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                showItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnimatedRelatedMangaSkeleton() {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowItems(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-1 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex gap-3 p-2 rounded-lg transition-all duration-300 ${
              showItems ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <Skeleton className="h-16 w-12 rounded" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

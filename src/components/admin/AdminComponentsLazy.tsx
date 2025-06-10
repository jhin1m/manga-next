'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// Lazy load admin components
const StorageTest = lazy(() => import('./storage-test').then(module => ({ default: module.StorageTest })));

// Loading skeleton for admin components
function AdminComponentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Generic loading component
function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading admin component...</span>
      </div>
    </div>
  );
}

// Storage Test Lazy Component
export function StorageTestLazy() {
  return (
    <Suspense fallback={<AdminComponentSkeleton />}>
      <StorageTest />
    </Suspense>
  );
}

// Generic Admin Component Lazy Wrapper
interface AdminComponentLazyProps {
  component: 'storage-test';
  fallback?: React.ReactNode;
}

export function AdminComponentLazy({ 
  component, 
  fallback = <AdminLoadingFallback /> 
}: AdminComponentLazyProps) {
  const renderComponent = () => {
    switch (component) {
      case 'storage-test':
        return <StorageTest />;
      default:
        return <div>Component not found</div>;
    }
  };

  return (
    <Suspense fallback={fallback}>
      {renderComponent()}
    </Suspense>
  );
}

export default AdminComponentLazy;

'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed loading overlay - using instant navigation
import { Loader2 } from 'lucide-react';

// Lazy load admin components
const StorageTest = lazy(() => import('./storage-test').then(module => ({ default: module.StorageTest })));

// Simple loading component for admin components
function AdminComponentLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading admin component...</span>
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
    <Suspense fallback={<AdminComponentLoading />}>
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

/**
 * BFCache Demo Page
 * 
 * This page demonstrates Back/Forward Cache functionality
 * and provides tools for testing and debugging BFCache behavior.
 */

import { Metadata } from 'next';
import BFCacheDemo from '@/components/demo/BFCacheDemo';
import { BFCacheStatus } from '@/components/providers/bfcache-provider';

export const metadata: Metadata = {
  title: 'BFCache Demo - Back/Forward Cache Testing',
  description: 'Test and debug Back/Forward Cache functionality in your browser',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BFCacheDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <BFCacheDemo />
      <BFCacheStatus />
    </div>
  );
}

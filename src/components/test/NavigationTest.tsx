'use client';

import { useInstantNavigation } from '@/components/providers/InstantNavigationProvider';
import SmartPrefetch from '@/components/optimization/SmartPrefetch';
import { Button } from '@/components/ui/button';

/**
 * Test component for instant navigation
 * Remove this file after testing
 */
export default function NavigationTest() {
  const { navigateInstantly } = useInstantNavigation();

  const testUrls = [
    '/manga',
    '/search',
    '/rankings',
  ];

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">Navigation Test</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Smart Prefetch Links:</h4>
          <div className="flex gap-2">
            {testUrls.map((url) => (
              <SmartPrefetch
                key={url}
                href={url}
                className="px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {url}
              </SmartPrefetch>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Instant Navigation Buttons:</h4>
          <div className="flex gap-2">
            {testUrls.map((url) => (
              <Button
                key={url}
                onClick={() => navigateInstantly(url)}
                variant="outline"
                size="sm"
              >
                Go to {url}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

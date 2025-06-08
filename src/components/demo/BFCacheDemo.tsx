/**
 * BFCache Demo Component
 * 
 * This component demonstrates BFCache functionality and provides
 * debugging information for developers.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  useBFCache, 
  useBFCacheDataRefresh, 
  useBFCachePerformance,
  useBFCacheEligibility 
} from '@/hooks/useBfcache';
import { useBFCacheContext } from '@/components/providers/bfcache-provider';

export default function BFCacheDemo() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('Never');
  
  // Use BFCache context
  const bfcacheContext = useBFCacheContext();
  
  // Use BFCache data refresh hook
  const bfcacheState = useBFCacheDataRefresh(() => {
    setRefreshCount(prev => prev + 1);
    setLastRefreshTime(new Date().toLocaleTimeString());
  });
  
  // Use performance monitoring
  const { restoreTime, storeTime } = useBFCachePerformance();
  
  // Use eligibility checking
  const { isEligible, reasons, refresh: refreshEligibility } = useBFCacheEligibility();
  
  // Manual data refresh
  const handleManualRefresh = () => {
    setRefreshCount(prev => prev + 1);
    setLastRefreshTime(new Date().toLocaleTimeString());
    bfcacheContext.refreshData();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">BFCache Demo</h1>
        <p className="text-muted-foreground">
          Navigate away and use browser back button to test BFCache functionality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BFCache Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              BFCache Status
              <Badge variant={bfcacheState.isSupported ? 'default' : 'destructive'}>
                {bfcacheState.isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Browser Support:</span>
              <Badge variant={bfcacheState.isSupported ? 'default' : 'destructive'}>
                {bfcacheState.isSupported ? '✅ Yes' : '❌ No'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Restored from Cache:</span>
              <Badge variant={bfcacheState.isRestored ? 'default' : 'secondary'}>
                {bfcacheState.isRestored ? '✅ Yes' : '❌ No'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Page Visible:</span>
              <Badge variant={bfcacheState.isVisible ? 'default' : 'secondary'}>
                {bfcacheState.isVisible ? '✅ Visible' : '👁️ Hidden'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Cache Eligible:</span>
              <Badge variant={isEligible ? 'default' : 'destructive'}>
                {isEligible ? '✅ Eligible' : '❌ Not Eligible'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Restore Time:</span>
              <Badge variant="outline">
                {restoreTime ? `${restoreTime.toFixed(2)}ms` : 'N/A'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Store Time:</span>
              <Badge variant="outline">
                {storeTime ? `${storeTime.toFixed(2)}ms` : 'N/A'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Data Refreshes:</span>
              <Badge variant="outline">
                {refreshCount}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Last Refresh:</span>
              <Badge variant="outline">
                {lastRefreshTime}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Issues */}
      {!isEligible && reasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">BFCache Eligibility Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-destructive">•</span>
                  <span className="text-sm">{reason}</span>
                </div>
              ))}
            </div>
            <Button 
              onClick={refreshEligibility} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Refresh Check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={handleManualRefresh} variant="default">
              Manual Data Refresh
            </Button>
            
            <Button 
              onClick={() => window.history.pushState({}, '', '/manga')} 
              variant="outline"
            >
              Navigate to Manga
            </Button>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Force Reload
            </Button>
            
            <Button 
              onClick={refreshEligibility} 
              variant="outline"
            >
              Check Eligibility
            </Button>
          </div>
          
          <Separator />
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>How to test BFCache:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Click "Navigate to Manga" or use any navigation link</li>
              <li>Use browser's back button to return to this page</li>
              <li>Check if "Restored from Cache" shows "Yes"</li>
              <li>Notice if data refreshed automatically</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Event Log */}
      <EventLog />
    </div>
  );
}

/**
 * Event Log Component to track BFCache events
 */
function EventLog() {
  const [events, setEvents] = useState<Array<{
    type: string;
    timestamp: string;
    details: string;
  }>>([]);

  useEffect(() => {
    const addEvent = (type: string, details: string) => {
      setEvents(prev => [
        {
          type,
          timestamp: new Date().toLocaleTimeString(),
          details
        },
        ...prev.slice(0, 9) // Keep only last 10 events
      ]);
    };

    // Listen for BFCache events
    const handleBFCacheRestore = () => {
      addEvent('BFCache Restore', 'Page restored from Back/Forward Cache');
    };

    const handleBFCacheStore = () => {
      addEvent('BFCache Store', 'Page stored in Back/Forward Cache');
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      addEvent(
        'Page Show', 
        `Persisted: ${event.persisted ? 'Yes' : 'No'}`
      );
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      addEvent(
        'Page Hide', 
        `Persisted: ${event.persisted ? 'Yes' : 'No'}`
      );
    };

    const handleVisibilityChange = () => {
      addEvent(
        'Visibility Change', 
        `Hidden: ${document.hidden ? 'Yes' : 'No'}`
      );
    };

    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('bfcache:restore', handleBFCacheRestore);
      window.addEventListener('bfcache:store', handleBFCacheStore);
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('pagehide', handlePageHide);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Initial event
      addEvent('Component Mounted', 'BFCache demo component initialized');
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('bfcache:restore', handleBFCacheRestore);
        window.removeEventListener('bfcache:store', handleBFCacheStore);
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('pagehide', handlePageHide);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-sm">No events yet...</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.map((event, index) => (
              <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <span className="font-medium">{event.type}</span>
                  <span className="text-muted-foreground ml-2">{event.details}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.timestamp}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

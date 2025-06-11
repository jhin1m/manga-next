/**
 * Performance monitoring utilities for manga website
 * Tracks component render times, API calls, and Web Vitals
 */

import React from 'react';

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'component' | 'api' | 'navigation' | 'custom' | 'web-vital';
  metadata?: Record<string, unknown>;
}

// Performance monitor class
export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  public static isEnabled = process.env.NODE_ENV === 'development' && process.env.ENABLE_PERFORMANCE_MONITORING === 'true';

  // Enable/disable monitoring
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Record a performance metric
  static recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && metric.duration > 100) {
      console.warn(`Slow ${metric.type}: ${metric.name} took ${metric.duration}ms`, metric);
    }
  }

  // Get all metrics
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Get metrics by type
  static getMetricsByType(type: PerformanceMetric['type']): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  // Clear all metrics
  static clearMetrics() {
    this.metrics = [];
  }

  // Measure component render time
  static measureComponent(name: string) {
    return function <T extends React.ComponentType<any>>(Component: T): T {
      if (!PerformanceMonitor.isEnabled) return Component;

      const WrappedComponent = (props: unknown) => {
        const startTime = React.useRef<number>(0);
        const renderCount = React.useRef<number>(0);

        // Measure render start
        startTime.current = performance.now();
        renderCount.current++;

        React.useEffect(() => {
          const endTime = performance.now();
          const duration = endTime - startTime.current;

          PerformanceMonitor.recordMetric({
            name,
            duration,
            timestamp: Date.now(),
            type: 'component',
            metadata: {
              renderCount: renderCount.current,
              props: Object.keys(props as object).length,
            },
          });
        });

        return React.createElement(Component, props);
      };

      WrappedComponent.displayName = `PerformanceMonitor(${name})`;
      return WrappedComponent as T;
    };
  }

  // Measure async function execution time
  static async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>,
    type: PerformanceMetric['type'] = 'custom',
    metadata?: Record<string, unknown>
  ): Promise<T> {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      
      this.recordMetric({
        name,
        duration: endTime - startTime,
        timestamp: Date.now(),
        type,
        metadata: { ...metadata, success: true },
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();

      this.recordMetric({
        name,
        duration: endTime - startTime,
        timestamp: Date.now(),
        type,
        metadata: {
          ...metadata,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
      });

      throw error;
    }
  }

  // Measure synchronous function execution time
  static measureSync<T>(
    name: string,
    fn: () => T,
    type: PerformanceMetric['type'] = 'custom',
    metadata?: Record<string, unknown>
  ): T {
    if (!this.isEnabled) return fn();

    const startTime = performance.now();
    
    try {
      const result = fn();
      const endTime = performance.now();
      
      this.recordMetric({
        name,
        duration: endTime - startTime,
        timestamp: Date.now(),
        type,
        metadata: { ...metadata, success: true },
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric({
        name,
        duration: endTime - startTime,
        timestamp: Date.now(),
        type,
        metadata: { 
          ...metadata, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        },
      });
      
      throw error;
    }
  }

  // Get performance summary
  static getSummary() {
    const metrics = this.getMetrics();
    const byType = metrics.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    const summary = Object.entries(byType).map(([type, durations]) => ({
      type,
      count: durations.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      total: durations.reduce((a, b) => a + b, 0),
    }));

    return summary;
  }

  // Log performance summary to console
  static logSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getSummary();
    console.group('🚀 Performance Summary');
    summary.forEach(({ type, count, average, min, max, total }) => {
      console.log(`${type.toUpperCase()}:`, {
        count,
        average: `${average.toFixed(2)}ms`,
        min: `${min.toFixed(2)}ms`,
        max: `${max.toFixed(2)}ms`,
        total: `${total.toFixed(2)}ms`,
      });
    });
    console.groupEnd();
  }
}

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window === 'undefined' || !PerformanceMonitor.isEnabled) return;

  // Track Core Web Vitals using native Performance API
  try {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track basic navigation timing
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          PerformanceMonitor.recordMetric({
            name: 'Page Load',
            duration: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: Date.now(),
            type: 'navigation',
            metadata: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstByte: navigation.responseStart - navigation.fetchStart,
            },
          });
        }
      });

      // Track Core Web Vitals using native PerformanceObserver
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            PerformanceMonitor.recordMetric({
              name: 'LCP',
              duration: lastEntry.startTime,
              timestamp: Date.now(),
              type: 'web-vital',
              metadata: { metric: 'largest-contentful-paint' },
            });
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          // LCP not supported in this browser
        }

        // First Input Delay (FID) - using first-input
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              PerformanceMonitor.recordMetric({
                name: 'FID',
                duration: entry.processingStart - entry.startTime,
                timestamp: Date.now(),
                type: 'web-vital',
                metadata: { metric: 'first-input-delay' },
              });
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {
          // FID not supported in this browser
        }

        // Cumulative Layout Shift (CLS) - using layout-shift
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            PerformanceMonitor.recordMetric({
              name: 'CLS',
              duration: clsValue,
              timestamp: Date.now(),
              type: 'web-vital',
              metadata: { metric: 'cumulative-layout-shift' },
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // CLS not supported in this browser
        }
      }
    }
  } catch (error) {
    console.error('Performance tracking setup failed:', error);
  }
};

// Hook for measuring component performance
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = React.useRef<number>(0);
  const renderCount = React.useRef<number>(0);

  React.useLayoutEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current++;
  });

  React.useEffect(() => {
    if (!PerformanceMonitor.isEnabled) return;
    
    const duration = performance.now() - renderStartTime.current;
    
    PerformanceMonitor.recordMetric({
      name: componentName,
      duration,
      timestamp: Date.now(),
      type: 'component',
      metadata: {
        renderCount: renderCount.current,
      },
    });
  });

  return {
    measureAsync: <T>(name: string, fn: () => Promise<T>) => 
      PerformanceMonitor.measureAsync(`${componentName}.${name}`, fn),
    measureSync: <T>(name: string, fn: () => T) => 
      PerformanceMonitor.measureSync(`${componentName}.${name}`, fn),
  };
};

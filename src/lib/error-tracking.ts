/**
 * Error tracking and logging utilities for manga website
 * Provides centralized error handling and reporting
 */

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

// Error report interface
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  fingerprint: string;
}

// Error tracking service
export class ErrorTracker {
  private static isEnabled = process.env.NODE_ENV === 'production';
  private static errors: ErrorReport[] = [];
  private static maxErrors = 50; // Keep last 50 errors in memory

  // Enable/disable error tracking
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Generate error fingerprint for deduplication
  private static generateFingerprint(error: Error, context: Partial<ErrorContext>): string {
    const key = `${error.name}-${error.message}-${context.component || 'unknown'}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Create error context
  private static createContext(additionalContext?: Partial<ErrorContext>): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...additionalContext,
    };
  }

  // Track an error
  static trackError(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Partial<ErrorContext>
  ): string {
    if (!this.isEnabled && process.env.NODE_ENV !== 'development') {
      return '';
    }

    const fullContext = this.createContext(context);
    const fingerprint = this.generateFingerprint(error, fullContext);
    
    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      severity,
      context: fullContext,
      fingerprint,
    };

    // Add to in-memory storage
    this.errors.push(errorReport);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Tracked [${severity.toUpperCase()}]`);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.log('Context:', fullContext);
      console.log('Fingerprint:', fingerprint);
      console.groupEnd();
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorReport).catch(console.error);
    }

    return errorReport.id;
  }

  // Send error to external tracking service
  private static async sendToExternalService(errorReport: ErrorReport): Promise<void> {
    try {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      // Example for Sentry:
      // Sentry.captureException(new Error(errorReport.message), {
      //   tags: { severity: errorReport.severity },
      //   contexts: { custom: errorReport.context },
      //   fingerprint: [errorReport.fingerprint],
      // });

      // For now, send to our own API endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      });
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
    }
  }

  // Track API errors
  static trackApiError(
    endpoint: string,
    status: number,
    message: string,
    context?: Partial<ErrorContext>
  ): string {
    const error = new Error(`API Error: ${endpoint} returned ${status} - ${message}`);
    error.name = 'ApiError';
    
    return this.trackError(error, ErrorSeverity.MEDIUM, {
      ...context,
      action: 'api_call',
      metadata: {
        endpoint,
        status,
        ...context?.metadata,
      },
    });
  }

  // Track component errors
  static trackComponentError(
    componentName: string,
    error: Error,
    props?: Record<string, unknown>
  ): string {
    return this.trackError(error, ErrorSeverity.HIGH, {
      component: componentName,
      action: 'component_render',
      metadata: { props },
    });
  }

  // Track user action errors
  static trackUserActionError(
    action: string,
    error: Error,
    context?: Partial<ErrorContext>
  ): string {
    return this.trackError(error, ErrorSeverity.MEDIUM, {
      ...context,
      action,
    });
  }

  // Get all tracked errors
  static getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  // Get errors by severity
  static getErrorsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }

  // Clear all errors
  static clearErrors(): void {
    this.errors = [];
  }

  // Get error statistics
  static getErrorStats() {
    const stats = this.errors.reduce((acc, error) => {
      acc.total++;
      acc.bySeverity[error.severity] = (acc.bySeverity[error.severity] || 0) + 1;
      
      if (error.context.component) {
        acc.byComponent[error.context.component] = (acc.byComponent[error.context.component] || 0) + 1;
      }
      
      return acc;
    }, {
      total: 0,
      bySeverity: {} as Record<ErrorSeverity, number>,
      byComponent: {} as Record<string, number>,
    });

    return stats;
  }
}

// React error boundary integration
export const trackBoundaryError = (error: Error, errorInfo: React.ErrorInfo) => {
  return ErrorTracker.trackError(error, ErrorSeverity.HIGH, {
    component: 'ErrorBoundary',
    action: 'boundary_catch',
    metadata: {
      componentStack: errorInfo.componentStack,
    },
  });
};

// Promise rejection handler
export const setupGlobalErrorHandlers = () => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    ErrorTracker.trackError(error, ErrorSeverity.HIGH, {
      action: 'unhandled_promise_rejection',
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error 
      ? event.error 
      : new Error(event.message);
    
    ErrorTracker.trackError(error, ErrorSeverity.CRITICAL, {
      action: 'uncaught_error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });
};

// Utility functions for common error scenarios
export const withErrorTracking = <T extends (...args: unknown[]) => any>(
  fn: T,
  context?: Partial<ErrorContext>
): T => {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          ErrorTracker.trackError(error, ErrorSeverity.MEDIUM, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        ErrorTracker.trackError(error, ErrorSeverity.MEDIUM, context);
      }
      throw error;
    }
  }) as T;
};

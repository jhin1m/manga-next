'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className='flex flex-col items-center justify-center min-h-[400px] p-8 text-center'>
          <div className='mb-6'>
            <AlertTriangle className='h-16 w-16 text-destructive mx-auto mb-4' />
            <h2 className='text-2xl font-bold mb-2'>Oops! Something went wrong</h2>
            <p className='text-muted-foreground mb-4 max-w-md'>
              We&apos;re sorry for the inconvenience. The page encountered an unexpected error.
            </p>
          </div>

          <div className='space-y-3'>
            <Button onClick={this.handleRetry} className='flex items-center gap-2'>
              <RefreshCw className='h-4 w-4' />
              Try Again
            </Button>

            <Button
              variant='outline'
              onClick={() => window.location.reload()}
              className='flex items-center gap-2'
            >
              Refresh Page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className='mt-6 p-4 bg-muted rounded-lg text-left max-w-2xl w-full'>
              <summary className='cursor-pointer font-medium mb-2'>
                Error Details (Development Only)
              </summary>
              <pre className='text-sm overflow-auto'>
                <code>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack &&
                    '\n\nComponent Stack:' + this.state.errorInfo.componentStack}
                </code>
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Custom error fallback components
export const MangaReaderErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className='flex flex-col items-center justify-center min-h-[60vh] p-8'>
    <AlertTriangle className='h-12 w-12 text-destructive mb-4' />
    <h3 className='text-xl font-semibold mb-2'>Failed to load manga reader</h3>
    <p className='text-muted-foreground mb-4 text-center max-w-md'>
      There was an error loading the manga reader. Please try again.
    </p>
    <Button onClick={retry} className='flex items-center gap-2'>
      <RefreshCw className='h-4 w-4' />
      Retry
    </Button>
  </div>
);

export const SearchErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div className='flex flex-col items-center justify-center p-6'>
    <AlertTriangle className='h-8 w-8 text-destructive mb-3' />
    <h4 className='font-medium mb-2'>Search Error</h4>
    <p className='text-sm text-muted-foreground mb-3 text-center'>
      Unable to perform search. Please try again.
    </p>
    <Button size='sm' onClick={retry}>
      Retry Search
    </Button>
  </div>
);

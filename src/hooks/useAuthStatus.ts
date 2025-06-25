import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean | null; // null = loading
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  lastChecked: number | null;
}

export interface AuthStatusResponse {
  success: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  timestamp: number;
  error?: string;
}

/**
 * Hook để check authentication status bypass cache
 * Sử dụng dedicated API endpoint không bị cache bởi Cloudflare
 */
export function useAuthStatus() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: null,
    user: null,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/status', {
        method: 'GET',
        cache: 'no-store', // Force no cache
        credentials: 'include', // Include cookies
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AuthStatusResponse = await response.json();
      
      setAuthState({
        isAuthenticated: data.isAuthenticated,
        user: data.user,
        isLoading: false,
        error: null,
        lastChecked: Date.now()
      });

    } catch (error) {
      console.error('[AUTH_STATUS_CHECK_ERROR]', error);
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check auth status',
        lastChecked: Date.now()
      });
    }
  }, []);

  // Initial check khi component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Refresh function để manually trigger recheck
  const refreshAuthStatus = useCallback(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Auto refresh khi window focus (user quay lại tab)
  useEffect(() => {
    const handleFocus = () => {
      // Chỉ refresh nếu đã check trước đó và > 30s
      if (authState.lastChecked && Date.now() - authState.lastChecked > 30000) {
        checkAuthStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [authState.lastChecked, checkAuthStatus]);

  // Listen for custom auth status change events (từ login/logout)
  useEffect(() => {
    const handleAuthStatusChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-status-changed', handleAuthStatusChange);
    return () => window.removeEventListener('auth-status-changed', handleAuthStatusChange);
  }, [checkAuthStatus]);

  return {
    ...authState,
    refreshAuthStatus
  };
}

/**
 * Hook variant với auto-polling cho real-time updates
 */
export function useAuthStatusWithPolling(intervalMs: number = 60000) {
  const authStatus = useAuthStatus();

  useEffect(() => {
    if (intervalMs <= 0) return;

    const interval = setInterval(() => {
      // Chỉ poll khi tab active
      if (!document.hidden) {
        authStatus.refreshAuthStatus();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, authStatus.refreshAuthStatus]);

  return authStatus;
} 
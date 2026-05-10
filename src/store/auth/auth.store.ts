/**
 * Authentication Store using Zustand
 * Manages user authentication state, token, and auth operations
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * User interface for authenticated user
 */
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  lastLogin?: Date | string;
    companyName?: string;
}

/**
 * Auth State interface
 */
interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth Actions interface
 */
interface AuthActions {
  // Actions
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Authentication Store
 * 
 * Features:
 * - Persistent storage (localStorage)
 * - DevTools integration for debugging
 * - Centralized auth state management
 * 
 * Usage:
 * ```typescript
 * const { user, isAuthenticated, setAuth, logout } = useAuthStore();
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Set user data
         */
        setUser: (user: AuthUser) => {
          set(
            {
              user,
              isAuthenticated: true,
              error: null,
            },
            false,
            'auth/setUser'
          );
        },

        /**
         * Set authentication token
         */
        setToken: (token: string) => {
          set(
            {
              token,
              error: null,
            },
            false,
            'auth/setToken'
          );

          // Also set in localStorage for backward compatibility
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
            // Set cookie for middleware
            document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
        },

        /**
         * Set both user and token (typically after login)
         */
        setAuth: (user: AuthUser, token: string) => {
          set(
            {
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            false,
            'auth/setAuth'
          );

          // Set in localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
            document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
        },

        /**
         * Clear authentication state
         */
        clearAuth: () => {
          set(
            {
              ...initialState,
            },
            false,
            'auth/clearAuth'
          );

          // Clear localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
            document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
          }
        },

        /**
         * Set loading state
         */
        setLoading: (isLoading: boolean) => {
          set({ isLoading }, false, 'auth/setLoading');
        },

        /**
         * Set error message
         */
        setError: (error: string | null) => {
          set({ error, isLoading: false }, false, 'auth/setError');
        },

        /**
         * Logout user
         */
        logout: async () => {
          const { token } = get();

          // Call logout API if token exists
          if (token) {
            try {
              await fetch('/api/logout', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            } catch (error) {
              console.error('Logout API error:', error);
              // Continue with logout even if API fails
            }
          }

          // Clear auth state
          get().clearAuth();

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        },

        /**
         * Check authentication status by validating token with backend
         */
        checkAuth: async (): Promise<boolean> => {
          const { token } = get();

          if (!token) {
            get().clearAuth();
            return false;
          }

          try {
            set({ isLoading: true }, false, 'auth/checkAuth/loading');

            const response = await fetch('/api/me', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              get().clearAuth();
              return false;
            }

            const data = await response.json();

            if (data.success && data.data) {
              set(
                {
                  user: data.data,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                },
                false,
                'auth/checkAuth/success'
              );
              return true;
            }

            get().clearAuth();
            return false;
          } catch (error) {
            console.error('Auth check error:', error);
            get().clearAuth();
            return false;
          } finally {
            set({ isLoading: false }, false, 'auth/checkAuth/complete');
          }
        },
      }),
      {
        name: 'auth-storage',
        // Only persist specific fields
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

/**
 * Selectors for optimized component rendering
 */
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  token: (state: AuthStore) => state.token,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
};

/**
 * Client-side Authentication Service
 * Handles all auth-related API calls and state updates
 */

import { useAuthStore } from '@/store';
import type { LoginInput } from '@/server/validations';

/**
 * Login response interface
 */
interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  message?: string;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Auth Service Class
 * Provides methods for authentication operations
 */
class AuthService {
  /**
   * Login user
   * @param credentials - Email and password
   * @returns Login response with token and user data
   */
  async login(credentials: LoginInput): Promise<LoginResponse> {
    // Start minimum delay timer (3 seconds for better UX)
    const minDelay = new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Wait for minimum delay before throwing error
      await minDelay;
      throw data as ErrorResponse;
    }

    // Wait for minimum delay before returning success
    await minDelay;

    // Update auth store
    if (data.success && data.data) {
      const { setAuth } = useAuthStore.getState();
      setAuth(data.data.user, data.data.token);
    }

    return data;
  }

  /**
   * Logout user
   * Clears token and redirects to login
   */
  async logout(): Promise<void> {
    const { logout } = useAuthStore.getState();
    await logout();
  }

  /**
   * Get current authenticated user
   * @returns User data or null if not authenticated
   */
  async getCurrentUser() {
    const { token, setUser, clearAuth } = useAuthStore.getState();

    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        clearAuth();
        return null;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setUser(data.data);
        return data.data;
      }

      clearAuth();
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      clearAuth();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  async checkAuth(): Promise<boolean> {
    const { checkAuth } = useAuthStore.getState();
    return checkAuth();
  }

  /**
   * Get auth token from store
   * @returns Token string or null
   */
  getToken(): string | null {
    const { token } = useAuthStore.getState();
    return token;
  }

  /**
   * Get current user from store (without API call)
   * @returns User data or null
   */
  getUser() {
    const { user } = useAuthStore.getState();
    return user;
  }

  /**
   * Check if current user is admin
   * @returns True if user has admin role
   */
  isAdmin(): boolean {
    const { user } = useAuthStore.getState();
    return user?.role === 'ADMIN' || user?.role === 'admin';
  }

  /**
   * Check if user is authenticated (from store)
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    const { isAuthenticated } = useAuthStore.getState();
    return isAuthenticated;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export for testing or advanced use cases
export default authService;

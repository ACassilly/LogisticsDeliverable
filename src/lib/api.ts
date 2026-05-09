/**
 * API Client Configuration
 * Axios instance with interceptors for consistent API calls
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT } from '@/constants';
import { useAuthStore } from '@/store';

/**
 * Create axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Add authorization token to requests if available
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Zustand store (preferred) or fallback to localStorage
    let token: string | null = null;

    if (typeof window !== 'undefined') {
      // Try to get from Zustand store first
      try {
        token = useAuthStore.getState().token;
      } catch {
        // If store is not initialized yet, fallback to localStorage
        token = localStorage.getItem('admin_token');
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          if (typeof window !== 'undefined') {
            const { clearAuth } = useAuthStore.getState();
            clearAuth();
            
            // Only redirect if we're on an admin route
            if (window.location.pathname.startsWith('/admin') && 
                !window.location.pathname.startsWith('/admin/login')) {
              window.location.href = '/admin/login';
            }
          }
          break;
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
        case 404:
          console.error('Not found: The requested resource does not exist');
          break;
        case 500:
          console.error('Server error: Please try again later');
          break;
        default:
          // Safely log error data
          if (error.response?.data) {
            console.error('An error occurred:', error.response.data);
          } else {
            console.error('An error occurred:', error.message || 'Unknown error');
          }
      }
    } else if (error.request) {
      console.error('Network error: Please check your connection');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Create a simple fetch-based API client for server components
 * This is useful for Next.js server components that can't use axios
 */
export const fetchAPI = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};


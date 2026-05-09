// Application Constants

/**
 * API Configuration
 */
export const NEXT_PUBLIC_API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const API_TIMEOUT = 30000; // 30 seconds

/**
 * React Query Configuration
 */
export const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const QUERY_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Application Configuration
 */
export const APP_NAME = 'Portland  Logistics';
export const APP_DESCRIPTION = 'Manage your logistics efficiently with Portland Logistics.';

/**
 * Blog Configuration
 */
export const BLOG_CATEGORIES = {
  ltl: 'LTL',
  ftl: 'FTL',
  intermodal: 'Intermodal',
  drayage: 'Drayage',
} as const;

/**
 * Quote/Rate API Endpoints
 */
export const QUOTE_API_ENDPOINTS = {
  GET_RATE: '/api/quote/rate',
  GET_ALL_RATES: '/api/quote/rate/v2',
} as const;

export const CHECKOUT_API_ENDPOINTS = {
  CREATE_SESSION: '/api/quote/checkout',
  VERIFY_SESSION: '/api/quote/checkout/verify',
} as const;

export const CONTACT_API_ENDPOINTS = {
  SUBMIT: '/api/contact',
} as const;

export const BLOG_API_ENDPOINTS = {
  // Admin endpoints
  ADMIN_BLOGS: '/api/blogs',
  ADMIN_BLOG_BY_ID: (id: string) => `/api/blogs/${id}`,
  UPLOAD_IMAGE: '/api/upload',
  
  // Public endpoints
  PUBLIC_BLOGS: '/api/blogs/published',
  PUBLIC_BLOG_BY_SLUG: (slug: string) => `/api/blogs/slug/${slug}`,
  BLOG_CATEGORIES: '/api/blogs/published?type=categories',
  BLOG_TAGS: '/api/blogs/published?type=tags',
} as const;

/**
 * Services
 */
export { 
  SERVICES_DATA, 
  SERVICE_SLUGS, 
  getServiceData,
} from './services';

// Service types are now exported from @/types
// import type { ServiceType, ServiceData, Button } from '@/types';

/**
 * Add your application constants here
 * Examples:
 * - Feature flags
 * - Route paths
 * - Default values
 * - Error messages
 */
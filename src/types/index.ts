/**
 * Shared TypeScript types and interfaces
 * Define common types used across the application
 */

// Booking types
export * from "./booking.types"

// Quote / GTZShip types
export * from "./quote.types"

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * User Role enum — Portlandia Logistics multi-role portal
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  DISPATCHER = 'DISPATCHER',
  SHIPPER = 'SHIPPER',
  CARRIER = 'CARRIER',
  LEADERSHIP = 'LEADERSHIP',
}

/**
 * Role-to-portal route mapping
 */
export const ROLE_PORTAL_MAP: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin/portal',
  [UserRole.AGENT]: '/portal/agent',
  [UserRole.DISPATCHER]: '/portal/dispatcher',
  [UserRole.SHIPPER]: '/portal/shipper',
  [UserRole.CARRIER]: '/portal/carrier',
  [UserRole.LEADERSHIP]: '/portal/leadership',
};

/**
 * User type
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * JWT token payload shape
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Blog Category enum
 */
export enum BlogCategory {
  LTL = 'ltl',
  FTL = 'ftl',
  INTERMODAL = 'intermodal',
  DRAYAGE = 'drayage',
}

/**
 * Blog interface
 */
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: BlogCategory;
  tags: string[];
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  readingTime?: number;
}

/**
 * Blog filters for querying
 */
export interface BlogFilters {
  published?: boolean;
  category?: BlogCategory;
  search?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Service types
 */
export type ServiceType = 'ltl' | 'ftl' | 'intermodal' | 'drayage';

export interface Button {
  text: string;
  link: string;
  variant: 'primary' | 'secondary';
}

export interface ServiceData {
  slug: ServiceType;
  title: string;
  shortDescription: string;
  hero: {
    title: string;
    description: string;
    imageUrl: string;
    highlights: string[];
    buttons: Button[];
  };
  whyChoose: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  whatIs: {
    title: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
  };
  book: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    youtubeUrl: string;
  };
  builtFor: {
    title: string;
    imageUrl: string;
    items: Array<{
      title: string;
      description: string;
    }>;
    buttonText: string;
    buttonLink: string;
  };
}

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Contact form submission response from /api/contact
 */
export interface ContactSubmissionResponse {
  success: boolean;
  data?: { leadId: number };
  message?: string;
  error?: string;
}

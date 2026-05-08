export * from "./booking.types"
export * from "./quote.types"

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  DISPATCHER = 'DISPATCHER',
  SHIPPER = 'SHIPPER',
  CARRIER = 'CARRIER',
  LEADERSHIP = 'LEADERSHIP',
}

export const ROLE_PORTAL_MAP: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin/portal',
  [UserRole.AGENT]: '/portal/agent',
  [UserRole.DISPATCHER]: '/portal/dispatcher',
  [UserRole.SHIPPER]: '/portal/shipper',
  [UserRole.CARRIER]: '/portal/carrier',
  [UserRole.LEADERSHIP]: '/portal/leadership',
};

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

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export enum BlogCategory {
  LTL = 'ltl',
  FTL = 'ftl',
  INTERMODAL = 'intermodal',
  DRAYAGE = 'drayage',
}

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

export interface BlogFilters {
  published?: boolean;
  category?: BlogCategory;
  search?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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
  hero: { title: string; description: string; imageUrl: string; highlights: string[]; buttons: Button[]; };
  whyChoose: { title: string; subtitle: string; items: Array<{ title: string; description: string; icon: string; }>; };
  whatIs: { title: string; description: string; imageUrl: string; buttonText: string; buttonLink: string; };
  book: { title: string; description: string; buttonText: string; buttonLink: string; youtubeUrl: string; };
  builtFor: { title: string; imageUrl: string; items: Array<{ title: string; description: string; }>; buttonText: string; buttonLink: string; };
}

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ContactSubmissionResponse {
  success: boolean;
  data?: { leadId: number };
  message?: string;
  error?: string;
}

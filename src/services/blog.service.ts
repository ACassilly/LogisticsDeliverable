/**
 * Frontend Blog Service
 * API calls for blog-related operations
 */

import { apiClient } from '@/lib/api';
import { BLOG_API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Blog, BlogFilters, PaginationParams } from '@/types';

/**
 * Response type for paginated blogs
 */
interface BlogsResponse {
  success: boolean;
  data: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get published blogs (Public API - no auth required)
 * @param filters - Optional filters for category, search, tags
 * @param pagination - Page and limit
 * @returns Promise with blogs and pagination info
 */
export async function getPublishedBlogs(
  filters?: BlogFilters,
  pagination?: PaginationParams
): Promise<BlogsResponse> {
  const params = new URLSearchParams();

  // Add filters
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.tags?.length) params.append('tags', filters.tags.join(','));

  // Add pagination
  if (pagination?.page) params.append('page', pagination.page.toString());
  if (pagination?.limit) params.append('limit', pagination.limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${BLOG_API_ENDPOINTS.PUBLIC_BLOGS}?${queryString}`
    : BLOG_API_ENDPOINTS.PUBLIC_BLOGS;

  const response = await apiClient.get<BlogsResponse>(url);
  return response.data;
}

/**
 * Get single blog by slug (Public API - no auth required)
 * @param slug - Blog slug
 * @returns Promise with blog data
 */
export async function getBlogBySlug(slug: string): Promise<Blog> {
  const response = await apiClient.get<ApiResponse<Blog>>(
    BLOG_API_ENDPOINTS.PUBLIC_BLOG_BY_SLUG(slug)
  );
  return response.data.data;
}

/**
 * Get blog categories with count (Public API - no auth required)
 * @returns Promise with categories and their counts
 */
export async function getBlogCategories(): Promise<Array<{ category: string; count: number }>> {
  const response = await apiClient.get<ApiResponse<Array<{ category: string; count: number }>>>(
    BLOG_API_ENDPOINTS.BLOG_CATEGORIES
  );
  return response.data.data;
}

/**
 * Get popular tags (Public API - no auth required)
 * @param limit - Number of tags to return
 * @returns Promise with popular tags and their counts
 */
export async function getPopularTags(
  limit: number = 20
): Promise<Array<{ tag: string; count: number }>> {
  const response = await apiClient.get<ApiResponse<Array<{ tag: string; count: number }>>>(
    `${BLOG_API_ENDPOINTS.BLOG_TAGS}&limit=${limit}`
  );
  return response.data.data;
}

/**
 * Get featured blogs for homepage
 * Returns the 9 most recent published blogs
 * @returns Promise with featured blogs
 */
export async function getFeaturedBlogs(): Promise<Blog[]> {
  const response = await getPublishedBlogs(undefined, { page: 1, limit: 9 });
  return response.data;
}

// ========== ADMIN OPERATIONS (Require Authentication) ==========

/**
 * Get all blogs (Admin - includes drafts)
 * @param filters - Optional filters
 * @param pagination - Page and limit
 * @returns Promise with all blogs
 */
export async function getAllBlogs(
  filters?: BlogFilters,
  pagination?: PaginationParams
): Promise<BlogsResponse> {
  const params = new URLSearchParams();

  // Add filters
  if (filters?.published !== undefined) {
    params.append('published', filters.published.toString());
  }
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.tags?.length) params.append('tags', filters.tags.join(','));

  // Add pagination
  if (pagination?.page) params.append('page', pagination.page.toString());
  if (pagination?.limit) params.append('limit', pagination.limit.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${BLOG_API_ENDPOINTS.ADMIN_BLOGS}?${queryString}`
    : BLOG_API_ENDPOINTS.ADMIN_BLOGS;

  const response = await apiClient.get<BlogsResponse>(url);
  return response.data;
}

/**
 * Get single blog by ID (Admin)
 * @param id - Blog ID
 * @returns Promise with blog data
 */
export async function getBlogById(id: string): Promise<Blog> {
  const response = await apiClient.get<ApiResponse<Blog>>(
    BLOG_API_ENDPOINTS.ADMIN_BLOG_BY_ID(id)
  );
  return response.data.data;
}

/**
 * Create new blog (Admin)
 * @param blogData - Blog data
 * @returns Promise with created blog
 */
export async function createBlog(blogData: Partial<Blog>): Promise<Blog> {
  const response = await apiClient.post<ApiResponse<Blog>>(
    BLOG_API_ENDPOINTS.ADMIN_BLOGS,
    blogData
  );
  return response.data.data;
}

/**
 * Update blog (Admin)
 * @param id - Blog ID
 * @param blogData - Updated blog data
 * @returns Promise with updated blog
 */
export async function updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog> {
  const response = await apiClient.put<ApiResponse<Blog>>(
    BLOG_API_ENDPOINTS.ADMIN_BLOG_BY_ID(id),
    blogData
  );
  return response.data.data;
}

/**
 * Delete blog (Admin)
 * @param id - Blog ID
 * @returns Promise with success message
 */
export async function deleteBlog(id: string): Promise<void> {
  await apiClient.delete(BLOG_API_ENDPOINTS.ADMIN_BLOG_BY_ID(id));
}

/**
 * Duplicate blog (Admin)
 * Creates a copy of an existing blog as a draft
 * @param id - Blog ID to duplicate
 * @returns Promise with duplicated blog
 */
export async function duplicateBlog(id: string): Promise<Blog> {
  // Get the original blog
  const originalBlog = await getBlogById(id);
  
  // Create a new blog with the same content but as a draft
  const duplicatedData = {
    title: `${originalBlog.title} (Copy)`,
    content: originalBlog.content,
    excerpt: originalBlog.excerpt,
    category: originalBlog.category,
    tags: originalBlog.tags,
    imageUrl: originalBlog.imageUrl,
    published: false, // Always create duplicates as drafts
  };
  
  return await createBlog(duplicatedData);
}

/**
 * Upload image to Cloudinary (Admin)
 * @param file - Image file
 * @returns Promise with uploaded image URL
 */
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<{ url: string }>>(
    BLOG_API_ENDPOINTS.UPLOAD_IMAGE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}


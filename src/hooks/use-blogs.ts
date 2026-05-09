/**
 * Custom React Hook for Blog Operations
 * Uses React Query for data fetching and caching with optimized invalidation
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import {
  getPublishedBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getBlogCategories,
  getPopularTags,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '@/services';
import type { Blog, BlogFilters, PaginationParams } from '@/types';

/**
 * Hook to fetch featured blogs for homepage
 * Returns the 9 most recent published blogs
 */
export function useFeaturedBlogs() {
  return useQuery({
    queryKey: queryKeys.blogs.featured,
    queryFn: getFeaturedBlogs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes (renamed from cacheTime)
    retry: 2, // Retry failed requests twice
  });
}

/**
 * Hook to fetch published blogs with filters
 * @param filters - Optional filters (category, search, tags)
 * @param pagination - Page and limit
 */
export function usePublishedBlogs(
  filters?: BlogFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: queryKeys.blogs.published(filters, pagination),
    queryFn: () => getPublishedBlogs(filters, pagination),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a single blog by slug
 * @param slug - Blog slug
 * @param options - React Query options
 */
export function useBlogBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Blog>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.blogs.bySlug(slug),
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });
}

/**
 * Hook to fetch blog categories
 */
export function useBlogCategories() {
  return useQuery({
    queryKey: queryKeys.blogs.categories,
    queryFn: getBlogCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch popular tags
 * @param limit - Number of tags to fetch
 */
export function usePopularTags(limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.blogs.tags(limit),
    queryFn: () => getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

// ========== ADMIN HOOKS (Require Authentication) ==========

/**
 * Hook to fetch all blogs (Admin - includes drafts)
 * @param filters - Optional filters
 * @param pagination - Page and limit
 */
export function useAllBlogs(
  filters?: BlogFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: queryKeys.blogs.all(filters, pagination),
    queryFn: () => getAllBlogs(filters, pagination),
    staleTime: 1 * 60 * 1000, // 1 minute - admin data should be fresh
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Hook to fetch a single blog by ID (Admin)
 * @param id - Blog ID
 * @param options - Additional React Query options
 */
export function useBlogById(
  id: string,
  options?: Omit<UseQueryOptions<Blog>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.blogs.byId(id),
    queryFn: () => getBlogById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

/**
 * Hook to create a new blog (Admin)
 * Includes optimized cache invalidation
 */
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlog,
    onSuccess: (newBlog) => {
      // Invalidate and refetch admin blog lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blogs.all(),
        exact: false, // Invalidate all variations
      });
      
      // Only invalidate published blog queries if the new blog is published
      if (newBlog?.published) {
        queryClient.invalidateQueries({ queryKey: queryKeys.blogs.featured });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.blogs.published(),
          exact: false,
        });
      }
    },
    onError: (error) => {
      console.error('Failed to create blog:', error);
    },
  });
}

/**
 * Hook to update a blog (Admin)
 * Includes optimized cache invalidation and optimistic updates
 */
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Blog> }) =>
      updateBlog(id, data),
    
    // Optimistic update (optional - updates UI before server confirms)
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.byId(id) });
      
      // Snapshot the previous value
      const previousBlog = queryClient.getQueryData<Blog>(queryKeys.blogs.byId(id));
      
      // Optimistically update to the new value
      if (previousBlog) {
        queryClient.setQueryData<Blog>(queryKeys.blogs.byId(id), {
          ...previousBlog,
          ...data,
        });
      }
      
      return { previousBlog };
    },
    
    onSuccess: (updatedBlog, variables) => {
      // Update the specific blog in cache
      if (updatedBlog) {
        queryClient.setQueryData(queryKeys.blogs.byId(variables.id), updatedBlog);
        
        // Invalidate slug-based query if slug exists
        if (updatedBlog.slug) {
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.blogs.bySlug(updatedBlog.slug),
          });
        }
      }
      
      // Invalidate list queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blogs.all(),
        exact: false,
      });
      
      // Invalidate public queries if blog is published
      if (updatedBlog?.published) {
        queryClient.invalidateQueries({ queryKey: queryKeys.blogs.featured });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.blogs.published(),
          exact: false,
        });
      }
    },
    
    onError: (error, variables, context: unknown) => {
      // Rollback optimistic update on error
      const ctx = context as { previousBlog?: Blog };
      if (ctx?.previousBlog) {
        queryClient.setQueryData(
          queryKeys.blogs.byId(variables.id),
          ctx.previousBlog
        );
      }
      console.error('Failed to update blog:', error);
    },
  });
}

/**
 * Hook to delete a blog (Admin)
 * Includes optimized cache invalidation
 */
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlog,
    
    onSuccess: (_, deletedBlogId) => {
      // Remove the specific blog from cache
      queryClient.removeQueries({ queryKey: queryKeys.blogs.byId(deletedBlogId) });
      
      // Invalidate all list queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blogs.all(),
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.featured });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.blogs.published(),
        exact: false,
      });
    },
    
    onError: (error) => {
      console.error('Failed to delete blog:', error);
    },
  });
}


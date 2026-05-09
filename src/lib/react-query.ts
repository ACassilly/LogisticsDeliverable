// React Query Configuration
import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { QUERY_STALE_TIME, QUERY_CACHE_TIME } from '@/constants';

/**
 * Default options for React Query
 */
const queryConfig: DefaultOptions = {
  queries: {
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
};

/**
 * Create QueryClient instance
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query keys factory - Centralized query key management
 * Example usage in components:
 * const { data } = useQuery({ queryKey: queryKeys.users.all, ... })
 */
export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
  },
  blogs: {
    all: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
      ['blogs', 'all', filters, pagination] as const,
    published: (filters?: Record<string, unknown>, pagination?: Record<string, unknown>) =>
      ['blogs', 'published', filters, pagination] as const,
    featured: ['blogs', 'featured'] as const,
    byId: (id: string) => ['blogs', 'detail', id] as const,
    bySlug: (slug: string) => ['blogs', 'slug', slug] as const,
    categories: ['blogs', 'categories'] as const,
    tags: (limit?: number) => ['blogs', 'tags', limit] as const,
  },
  quotes: {
    rate: (params?: Record<string, unknown>) => ['quotes', 'rate', params] as const,
  },
} as const;

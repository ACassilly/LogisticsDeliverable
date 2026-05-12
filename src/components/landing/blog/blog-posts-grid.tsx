'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogCard } from '@/components/landing/blog/BlogCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getPublishedBlogs } from '@/services/blog.service';
import { BLOG_CATEGORIES } from '@/constants';
import type { Blog } from '@/types';
import { useBlogFilterStore } from '@/store';
import { BlogGridSkeleton } from '@/components/landing/blog/blog-loading-skeleton';

/**
 * Format date to readable string
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get category display name
 */
function getCategoryName(category: string): string {
  const normalized = category.toLowerCase() as keyof typeof BLOG_CATEGORIES;
  return BLOG_CATEGORIES[normalized] || category;
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function BlogPostsGrid() {
  const BLOGS_PER_PAGE = 9;
  
  // Get filter state from store
  const { searchQuery, selectedCategory, currentPage, setCurrentPage, setIsSearching } = useBlogFilterStore();

  // Build filters for API
  const filters: Record<string, unknown> = {};
  if (searchQuery) filters.search = searchQuery;
  if (selectedCategory && selectedCategory !== 'all') filters.category = selectedCategory;

  // Fetch published blogs with filters and pagination
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['published-blogs', searchQuery, selectedCategory, currentPage],
    queryFn: async () => {
      setIsSearching(true);
      try {
        return await getPublishedBlogs(filters, { page: currentPage, limit: BLOGS_PER_PAGE });
      } finally {
        setIsSearching(false);
      }
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  // Transform API data to match UI format
  const blogPosts = data?.data?.map((blog: Blog) => ({
    id: blog.slug,
    title: blog.title,
    description: blog.excerpt || stripHtml(blog.content).substring(0, 150) + '...',
    image: blog.imageUrl || "/images/services/customer-support.jpg",
    category: getCategoryName(blog.category),
    date: formatDate(blog.publishedAt || blog.createdAt)
  })) || [];

  // Pagination info
  const totalPages = data?.pagination?.pages || 1;
  const totalBlogs = data?.pagination?.total || 0;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, setCurrentPage]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <section className="container mx-auto px-4 md:px-12 lg:px-24">
      {/* Loading State with Shadcn Skeleton */}
      {isLoading && <BlogGridSkeleton count={9} />}

      {/* Blog Grid */}
      {!isLoading && (
        <>
          {/* Show fetching indicator */}
          {isFetching && (
            <div className="flex items-center justify-center gap-2 mb-4 text-[#3BAB6B]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Updating results...</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <BlogCard key={post.id + '-' + index} post={post} />
            ))}
          </div>

          {/* Show message if no blogs */}
          {blogPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'No blogs found matching your criteria.' 
                  : 'No published blogs yet. Check back soon!'}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filters.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination - Only show if there are multiple pages */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-20 flex justify-center items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="w-10 h-10 rounded-3xl flex items-center justify-center transition-all bg-white text-black border border-gray-100 hover:border-[#3BAB6B] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-3xl flex items-center justify-center font-bold text-sm transition-all ${
                page === currentPage
                  ? "btn-gradient-green text-white"
                  : "bg-gray-300 text-black border border-gray-100 hover:border-[#3BAB6B]"
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="w-10 h-10 rounded-3xl flex items-center justify-center transition-all bg-white text-black border border-gray-100 hover:border-[#3BAB6B] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {!isLoading && totalBlogs > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {((currentPage - 1) * BLOGS_PER_PAGE) + 1} - {Math.min(currentPage * BLOGS_PER_PAGE, totalBlogs)} of {totalBlogs} blog{totalBlogs !== 1 ? 's' : ''}
        </div>
      )}
    </section>
  );
}

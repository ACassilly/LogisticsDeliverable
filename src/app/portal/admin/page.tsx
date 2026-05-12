"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MoreVertical, Edit3, Trash2, Plus, LogOut, User, Loader2, RefreshCw, Eye } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBlogs } from '@/services/blog.service';
import { BLOG_CATEGORIES } from '@/constants';
import type { Blog } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useBlogActionsStore, useAuthStore } from '@/store';
import { BlogDeleteDialog } from '@/components/landing/blog/blog-delete-dialog';
import { authService } from '@/services';

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

const BlogPortal = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'live' | 'draft'>('live');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Auth store
  const { user, checkAuth } = useAuthStore();
  const adminName = user?.name || 'Admin';
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{ id: string; title: string } | null>(null);
  
  // Blog actions store
  const { 
    deleteBlogAction, 
    isDeletingBlogId,
    trackAction 
  } = useBlogActionsStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push('/admin/login');
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  // Fetch blogs based on active tab
  const { data: blogsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-blogs', activeTab, searchQuery],
    queryFn: () => getAllBlogs(
      { 
        published: activeTab === 'live' ? true : false,
        search: searchQuery || undefined
      },
      { page: 1, limit: 100 } // Show more blogs in admin
    ),
    staleTime: 10 * 1000, // Consider data stale after 10 seconds (for real-time updates)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 1, // Only retry once to avoid excessive errors
  });

  // Fetch live blogs count
  const { data: liveBlogsResponse, refetch: refetchLive } = useQuery({
    queryKey: ['admin-blogs-live-count'],
    queryFn: async () => {
      // Just need a minimal fetch to get the pagination.total
      const result = await getAllBlogs({ published: true }, { page: 1, limit: 1 });
      return result;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Fetch draft blogs count
  const { data: draftBlogsResponse, refetch: refetchDraft } = useQuery({
    queryKey: ['admin-blogs-draft-count'],
    queryFn: async () => {
      // Just need a minimal fetch to get the pagination.total
      const result = await getAllBlogs({ published: false }, { page: 1, limit: 1 });
      return result;
    },
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Get counts from pagination.total (the CORRECT way!)
  // Backend limits max 100 results per request, so we can't rely on array length
  // pagination.total gives us the ACTUAL count from the database
  const liveCount = liveBlogsResponse?.pagination?.total || 0;
  const draftCount = draftBlogsResponse?.pagination?.total || 0;

  const handleLogout = async () => {
    await authService.logout();
  };

  const handleEdit = (blogId: string) => {
    trackAction('edit', blogId);
    setOpenMenuId(null);
    router.push(`/admin/edit-blog/${blogId}`);
  };

  const handleView = (blogSlug: string, blogId: string, isPublished: boolean) => {
    trackAction('view', blogId);
    setOpenMenuId(null);
    // Open blog details page in a new tab
    // Add preview=true for draft blogs so they can be viewed
    const url = isPublished 
      ? `/blog/${blogSlug}` 
      : `/blog/${blogSlug}?preview=true`;
    window.open(url, '_blank');
  };

  const handleDeleteClick = (blogId: string, blogTitle: string) => {
    setBlogToDelete({ id: blogId, title: blogTitle });
    setDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;

    const success = await deleteBlogAction(blogToDelete.id, blogToDelete.title);
    
    if (success) {
      // Invalidate queries to refresh the list and counts
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-live-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs-draft-count'] });
      
      // Refetch immediately
      await Promise.all([refetch(), refetchLive(), refetchDraft()]);
      setLastRefreshTime(new Date());
      
      // Close dialog
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBlogToDelete(null);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchLive(), refetchDraft()]);
    setLastRefreshTime(new Date());
    toast.success('Portal refreshed!');
  };

  // Auto-refresh data when user successfully creates/edits/deletes a blog
  useEffect(() => {
    // Listen for storage events (when data changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blog_updated') {
        refetch();
        refetchLive();
        refetchDraft();
        setLastRefreshTime(new Date());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetch, refetchLive, refetchDraft]);

  const blogs = blogsData?.data || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 md:p-12">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        {/* Top Bar with Admin Info and Logout */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3BAB6B] flex items-center justify-center text-white font-bold">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 font-poppins">Blog Portal</h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-500 font-medium font-poppins">Think, write, post with the blog portal</p>
              {!isFetching && (
                <span className="text-xs text-gray-400">
                  • Updated {lastRefreshTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh to get latest blogs"
            >
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>

            {/* Add Blog Button */}
            <Link href="/admin/new-blog">
              <button className="flex items-center justify-center gap-2 px-6 py-3 btn-gradient-green text-white rounded-xl font-bold shadow-lg shadow-[#3BAB6B]/20 hover:opacity-90 transition-all">
                <Plus size={20} />
                Add Blog
              </button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-10">
          <div className="relative flex-1 min-w-[300px]">
            <input 
              type="text" 
              placeholder="Search blogs by title, content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#3BAB6B] outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
         
        </div>

        {/* Status Tabs */}
        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'live' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-gray-100 text-gray-500'
            }`}
            title={`${liveCount} published blog(s)`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            Live Blogs ({liveCount})
          </button>
          <button 
            onClick={() => setActiveTab('draft')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'draft' ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-500'
            }`}
            title={`${draftCount} draft blog(s)`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'draft' ? 'bg-gray-500' : 'bg-gray-400'}`} />
            Drafted Blogs ({draftCount})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#3BAB6B]" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && blogs.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-gray-500 text-lg mb-4">
            No {activeTab === 'live' ? 'published' : 'draft'} blogs yet.
          </p>
          <Link href="/admin/new-blog">
            <button className="px-6 py-3 btn-gradient-green text-white rounded-xl font-bold hover:opacity-90 transition-all">
              Create Your First Blog
            </button>
          </Link>
        </div>
      )}

      {/* Blog Grid */}
      {!isLoading && blogs.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: Blog) => (
            <div key={blog._id} className="bg-white rounded-[2rem] border border-gray-100 group shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="relative h-64 overflow-hidden rounded-t-[2rem]">
                <Image 
                  src={blog.imageUrl || "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800"} 
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-[#3BAB6B]">
                    {getCategoryName(blog.category)}
                  </span>
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    blog.published 
                      ? 'bg-green-500/90 text-white' 
                      : 'bg-yellow-500/90 text-white'
                  }`}>
                    {blog.published ? 'LIVE' : 'DRAFT'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 relative">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {formatDate(blog.updatedAt)}
                    </p>
                  </div>
                  
                  {/* Three Dots Menu */}
                  <div className="relative" ref={openMenuId === blog._id ? dropdownRef : null}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === blog._id ? null : blog._id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={20} className="text-gray-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === blog._id && (
                      <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] py-2 overflow-hidden">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(blog.slug, blog._id, blog.published);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                        >
                          <Eye size={16} /> View Blog
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(blog._id);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#E8F5ED] hover:text-[#3BAB6B] transition-colors"
                        >
                          <Edit3 size={16} /> Edit Blog
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(blog._id, blog.title);
                          }}
                          disabled={isDeletingBlogId === blog._id}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeletingBlogId === blog._id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} /> Delete
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {blog.excerpt || stripHtml(blog.content).substring(0, 100) + '...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <BlogDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        blogTitle={blogToDelete?.title || ''}
        isDeleting={isDeletingBlogId === blogToDelete?.id}
      />
    </div>
  );
};

export default BlogPortal;

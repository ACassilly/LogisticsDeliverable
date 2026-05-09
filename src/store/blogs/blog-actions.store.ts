/**
 * Blog Actions Store using Zustand
 * Manages blog operations: View, Edit, Delete with proper state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { deleteBlog } from '@/services/blog.service';
import toast from 'react-hot-toast';

interface BlogActionsState {
  // Loading states
  isDeletingBlogId: string | null;
  isViewingBlogId: string | null;
  
  // Last action tracking
  lastDeletedBlog: { id: string; title: string } | null;
  lastAction: {
    type: 'view' | 'edit' | 'delete' | null;
    blogId: string | null;
    timestamp: Date | null;
  };
  
  // Error state
  error: string | null;
}

interface BlogActionsActions {
  // Delete operations
  startDeleting: (blogId: string) => void;
  finishDeleting: () => void;
  deleteBlogAction: (blogId: string, blogTitle: string) => Promise<boolean>;
  
  // View operations
  startViewing: (blogId: string) => void;
  finishViewing: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Action tracking
  trackAction: (type: 'view' | 'edit' | 'delete', blogId: string) => void;
  clearLastAction: () => void;
}

type BlogActionsStore = BlogActionsState & BlogActionsActions;

const initialState: BlogActionsState = {
  isDeletingBlogId: null,
  isViewingBlogId: null,
  lastDeletedBlog: null,
  lastAction: {
    type: null,
    blogId: null,
    timestamp: null,
  },
  error: null,
};

/**
 * Blog Actions Store
 * Centralized state management for blog operations
 */
export const useBlogActionsStore = create<BlogActionsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      startDeleting: (blogId: string) => {
        set(
          { isDeletingBlogId: blogId, error: null },
          false,
          'blogActions/startDeleting'
        );
      },

      finishDeleting: () => {
        set(
          { isDeletingBlogId: null },
          false,
          'blogActions/finishDeleting'
        );
      },

      deleteBlogAction: async (blogId: string, blogTitle: string) => {
        get().startDeleting(blogId);

        // Minimum delay for loading state visibility (3 seconds)
        const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

        try {
          await deleteBlog(blogId);

          // Wait for minimum delay
          await minDelay;

          set(
            {
              isDeletingBlogId: null,
              lastDeletedBlog: { id: blogId, title: blogTitle },
              lastAction: {
                type: 'delete',
                blogId,
                timestamp: new Date(),
              },
              error: null,
            },
            false,
            'blogActions/deleteBlogAction/success'
          );

          // Trigger storage event for cross-tab sync
          if (typeof window !== 'undefined') {
            localStorage.setItem('blog_updated', Date.now().toString());
          }

          toast.success(`Blog "${blogTitle}" deleted successfully!`);
          return true;
        } catch (err: unknown) {
          // Wait for minimum delay even on error
          await minDelay;
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete blog';
          
          set(
            {
              isDeletingBlogId: null,
              error: errorMessage,
            },
            false,
            'blogActions/deleteBlogAction/error'
          );

          toast.error(errorMessage);
          console.error('Error deleting blog:', err);
          return false;
        }
      },

      startViewing: (blogId: string) => {
        set(
          { isViewingBlogId: blogId },
          false,
          'blogActions/startViewing'
        );
      },

      finishViewing: () => {
        set(
          { isViewingBlogId: null },
          false,
          'blogActions/finishViewing'
        );
      },

      setError: (error: string | null) => {
        set({ error }, false, 'blogActions/setError');
      },

      clearError: () => {
        set({ error: null }, false, 'blogActions/clearError');
      },

      trackAction: (type: 'view' | 'edit' | 'delete', blogId: string) => {
        set(
          {
            lastAction: {
              type,
              blogId,
              timestamp: new Date(),
            },
          },
          false,
          'blogActions/trackAction'
        );
      },

      clearLastAction: () => {
        set(
          {
            lastAction: {
              type: null,
              blogId: null,
              timestamp: null,
            },
          },
          false,
          'blogActions/clearLastAction'
        );
      },
    }),
    { name: 'BlogActionsStore' }
  )
);


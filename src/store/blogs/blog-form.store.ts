/**
 * Blog Form Store using Zustand
 * Manages blog form state, auto-save, and form operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createBlog, updateBlog } from '@/services/blog.service';
import toast from 'react-hot-toast';
import type { Blog } from '@/types';

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl: string;
}

interface BlogFormState {
  // Form data
  formData: BlogFormData;
  
  // UI State
  isLoading: boolean;
  isDraftSaving: boolean;
  lastSaved: Date | null;
  currentBlogId: string | null;
  
  // Auto-save
  autoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
}

interface BlogFormActions {
  // Form actions
  setFormData: (data: Partial<BlogFormData>) => void;
  resetForm: () => void;
  loadBlogData: (blog: Blog) => void;
  
  // Save operations
  saveDraft: (formData: BlogFormData, isAutoSave?: boolean) => Promise<boolean>;
  publishBlog: (formData: BlogFormData) => Promise<boolean>;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setDraftSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setCurrentBlogId: (id: string | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Auto-save
  toggleAutoSave: () => void;
}

type BlogFormStore = BlogFormState & BlogFormActions;

const initialFormData: BlogFormData = {
  title: '',
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  imageUrl: '',
};

const initialState: BlogFormState = {
  formData: initialFormData,
  isLoading: false,
  isDraftSaving: false,
  lastSaved: null,
  currentBlogId: null,
  autoSaveEnabled: true,
  hasUnsavedChanges: false,
};

/**
 * Blog Form Store
 * Centralized state management for blog creation and editing
 */
export const useBlogFormStore = create<BlogFormStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setFormData: (data: Partial<BlogFormData>) => {
        set(
          (state) => ({
            formData: { ...state.formData, ...data },
            hasUnsavedChanges: true,
          }),
          false,
          'blogForm/setFormData'
        );
      },

      resetForm: () => {
        set(
          {
            formData: initialFormData,
            isLoading: false,
            isDraftSaving: false,
            lastSaved: null,
            currentBlogId: null,
            hasUnsavedChanges: false,
          },
          false,
          'blogForm/resetForm'
        );
      },

      loadBlogData: (blog: Blog) => {
        set(
          {
            formData: {
              title: blog.title || '',
              content: blog.content || '',
              excerpt: blog.excerpt || '',
              category: blog.category || '',
              tags: blog.tags || [],
              imageUrl: blog.imageUrl || '',
            },
            currentBlogId: blog._id || null,
            lastSaved: blog.updatedAt ? new Date(blog.updatedAt) : null,
            hasUnsavedChanges: false,
          },
          false,
          'blogForm/loadBlogData'
        );
      },

      saveDraft: async (formData: BlogFormData, isAutoSave = false) => {
        const { currentBlogId } = get();
        
        set({ isDraftSaving: true }, false, 'blogForm/saveDraft/start');

        // Minimum delay for loading state visibility (3 seconds)
        const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const payload: Record<string, unknown> = {
            ...formData,
            published: false,
          };

          let result: unknown;
          if (currentBlogId) {
            // Update existing draft
            result = await updateBlog(currentBlogId, payload);
          } else {
            // Create new draft
            result = await createBlog(payload);
            const blogResult = result as { _id?: string; id?: string };
            set({ currentBlogId: blogResult._id || blogResult.id || null });
          }

          // Wait for minimum delay
          await minDelay;

          set(
            {
              isDraftSaving: false,
              lastSaved: new Date(),
              hasUnsavedChanges: false,
            },
            false,
            'blogForm/saveDraft/success'
          );

          // Trigger storage event for cross-tab sync
          if (typeof window !== 'undefined') {
            localStorage.setItem('blog_updated', Date.now().toString());
          }

          if (isAutoSave) {
            toast.success('Draft auto-saved successfully!', { duration: 2000 });
          } else {
            toast.success('Draft saved successfully!');
          }

          return true;
        } catch (err: unknown) {
          // Wait for minimum delay even on error
          await minDelay;
          set({ isDraftSaving: false }, false, 'blogForm/saveDraft/error');
          
          if (!isAutoSave) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save draft';
            toast.error(errorMessage);
          }
          
          console.error('Error saving draft:', err);
          return false;
        }
      },

      publishBlog: async (formData: BlogFormData) => {
        const { currentBlogId } = get();
        
        set({ isLoading: true }, false, 'blogForm/publishBlog/start');

        // Minimum delay for loading state visibility (3 seconds)
        const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const payload: Record<string, unknown> = {
            ...formData,
            published: true,
          };

          if (currentBlogId) {
            // Update and publish existing blog
            await updateBlog(currentBlogId, payload);
          } else {
            // Create and publish new blog
            await createBlog(payload);
          }

          // Wait for minimum delay
          await minDelay;

          set(
            {
              isLoading: false,
              lastSaved: new Date(),
              hasUnsavedChanges: false,
            },
            false,
            'blogForm/publishBlog/success'
          );

          // Trigger storage event for cross-tab sync
          if (typeof window !== 'undefined') {
            localStorage.setItem('blog_updated', Date.now().toString());
          }

          toast.success('Blog published successfully! 🎉');
          return true;
        } catch (err: unknown) {
          // Wait for minimum delay even on error
          await minDelay;
          set({ isLoading: false }, false, 'blogForm/publishBlog/error');
          
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          const errorMessage = error.response?.data?.message || error.message || 'Failed to publish blog';
          toast.error(errorMessage);
          
          console.error('Error publishing blog:', err);
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'blogForm/setLoading');
      },

      setDraftSaving: (saving: boolean) => {
        set({ isDraftSaving: saving }, false, 'blogForm/setDraftSaving');
      },

      setLastSaved: (date: Date) => {
        set({ lastSaved: date }, false, 'blogForm/setLastSaved');
      },

      setCurrentBlogId: (id: string | null) => {
        set({ currentBlogId: id }, false, 'blogForm/setCurrentBlogId');
      },

      setHasUnsavedChanges: (hasChanges: boolean) => {
        set({ hasUnsavedChanges: hasChanges }, false, 'blogForm/setHasUnsavedChanges');
      },

      toggleAutoSave: () => {
        set(
          (state) => ({ autoSaveEnabled: !state.autoSaveEnabled }),
          false,
          'blogForm/toggleAutoSave'
        );
      },
    }),
    { name: 'BlogFormStore' }
  )
);


/**
 * Blog Filter Store using Zustand
 * Manages blog filtering, search, and pagination state for user-facing blog pages
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type BlogCategoryFilter = 'all' | 'ltl' | 'ftl' | 'intermodal' | 'drayage';

interface BlogFilterState {
  // Filter state
  searchQuery: string;
  selectedCategory: BlogCategoryFilter;
  currentPage: number;
  
  // UI state
  isSearching: boolean;
}

interface BlogFilterActions {
  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: BlogCategoryFilter) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
  
  // UI actions
  setIsSearching: (isSearching: boolean) => void;
}

type BlogFilterStore = BlogFilterState & BlogFilterActions;

const initialState: BlogFilterState = {
  searchQuery: '',
  selectedCategory: 'all',
  currentPage: 1,
  isSearching: false,
};

/**
 * Blog Filter Store
 * Centralized state management for blog filtering on user-facing pages
 */
export const useBlogFilterStore = create<BlogFilterStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSearchQuery: (query: string) => {
        set(
          { searchQuery: query, currentPage: 1 }, // Reset to page 1 on search
          false,
          'blogFilter/setSearchQuery'
        );
      },

      setSelectedCategory: (category: BlogCategoryFilter) => {
        set(
          { selectedCategory: category, currentPage: 1 }, // Reset to page 1 on category change
          false,
          'blogFilter/setSelectedCategory'
        );
      },

      setCurrentPage: (page: number) => {
        set({ currentPage: page }, false, 'blogFilter/setCurrentPage');
      },

      resetFilters: () => {
        set(initialState, false, 'blogFilter/resetFilters');
      },

      setIsSearching: (isSearching: boolean) => {
        set({ isSearching }, false, 'blogFilter/setIsSearching');
      },
    }),
    { name: 'BlogFilterStore' }
  )
);


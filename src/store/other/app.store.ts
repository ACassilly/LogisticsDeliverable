// Main application store using Zustand
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  // App-level state
  isLoading: boolean;
  isSidebarOpen: boolean;
}

interface AppActions {
  setLoading: (isLoading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  isLoading: false,
  isSidebarOpen: true,
};

/**
 * Main application store
 * Add your global state here as your app grows
 */
export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setLoading: (isLoading: boolean) => {
        set({ isLoading }, false, 'app/setLoading');
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'app/toggleSidebar');
      },

      setSidebarOpen: (isOpen: boolean) => {
        set({ isSidebarOpen: isOpen }, false, 'app/setSidebarOpen');
      },
    }),
    { name: 'AppStore' }
  )
);


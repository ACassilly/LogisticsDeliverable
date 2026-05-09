'use client';

// Providers component for client-side providers
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './react-query';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers wrapper for client-side providers
 * - React Query for server state management
 * - React Query Devtools for debugging (dev only)
 * 
 * Add more providers here as needed:
 * - Theme Provider (if using themes)
 * - Auth Provider (if using authentication context)
 * - Notification Provider (toast/notifications)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

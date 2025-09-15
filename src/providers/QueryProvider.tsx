'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient instance với configuration phù hợp
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: dữ liệu được coi là "tươi" trong 5 phút
            staleTime: 5 * 60 * 1000,
            // Cache time: dữ liệu được cache trong 10 phút
            gcTime: 10 * 60 * 1000,
            // Retry failed requests up to 2 times
            retry: 2,
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry failed mutations up to 1 time
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

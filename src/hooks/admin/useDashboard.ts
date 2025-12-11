/**
 * React Query hooks for Admin Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/lib/api/admin/dashboard';
import type { DashboardResponse } from '@/types/admin';

/**
 * Hook to fetch dashboard overview data
 */
export function useDashboardOverview() {
  return useQuery<DashboardResponse>({
    queryKey: ['admin', 'dashboard', 'overview'],
    queryFn: getDashboardOverview,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for 5xx errors or network errors
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
}

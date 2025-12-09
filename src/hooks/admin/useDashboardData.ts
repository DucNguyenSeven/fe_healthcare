/**
 * React Query Hook for Admin Dashboard Data
 *
 * Usage:
 * ```typescript
 * const { data, isLoading, error } = useDashboardData();
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/lib/api/admin/dashboard';
import type { DashboardResponse } from '@/types/admin';

export function useDashboardData() {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboardOverview,
    // Cache data for 5 minutes (as recommended in API docs)
    staleTime: 5 * 60 * 1000,
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Retry failed requests 2 times
    retry: 2,
  });
}

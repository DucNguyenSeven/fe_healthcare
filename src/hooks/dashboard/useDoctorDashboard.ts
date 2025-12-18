/**
 * React Query Hook for Doctor Dashboard
 * Fetches and caches doctor dashboard data with automatic refresh
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardAPI } from '@/lib/api/dashboard';
import type { DoctorDashboardResponse } from '@/types/doctor-dashboard';

/**
 * Custom hook to fetch doctor dashboard data
 *
 * @param doctorId - Doctor's user ID (UUID)
 * @param date - Optional date in YYYY-MM-DD format (defaults to today)
 * @returns React Query result with dashboard data, loading state, and error
 *
 * @example
 * const { data, isLoading, error, refetch } = useDoctorDashboard(user.userId);
 *
 * @example
 * // With specific date
 * const { data } = useDoctorDashboard(user.userId, '2025-11-24');
 */
export function useDoctorDashboard(doctorId: string, date?: string) {
  return useQuery({
    // Unique query key including doctorId and date for proper cache segmentation
    queryKey: ['doctor-dashboard', doctorId, date],

    // Query function to fetch data
    queryFn: () => DashboardAPI.getDoctorDashboard(doctorId, date),

    // Extract data from MessageResponse wrapper
    select: (response) => response.data,

    // Only fetch if doctorId exists (prevents unnecessary API calls)
    enabled: !!doctorId,

    // Retry once on failure
    retry: 1,

    // Cache strategy (matches useGetMe pattern)
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 min
    gcTime: 10 * 60 * 1000,   // 10 minutes - cache is kept for 10 min (formerly cacheTime)

    // Automatic refetch behavior
    refetchOnWindowFocus: true,  // Refetch when user returns to tab
    refetchOnReconnect: true,    // Refetch when network reconnects
  });
}

/**
 * Type export for hook return value
 */
export type UseDoctorDashboardResult = ReturnType<typeof useDoctorDashboard>;

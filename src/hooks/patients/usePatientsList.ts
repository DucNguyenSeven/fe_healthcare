/**
 * React Query Hook for Patients List
 * Fetches and caches doctor's patient list with pagination
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getPatientsListByDoctorId, type GetPatientsListParams } from '@/lib/api/patients';

/**
 * Custom hook to fetch doctor's patient list
 *
 * @param params - Query parameters (doctorId, page, size, sortBy, sortDir, namePatient)
 * @returns React Query result with patient list data, loading state, and error
 *
 * @example
 * const { data, isLoading, error } = usePatientsList({
 *   doctorId: 'DOC123',
 *   page: 0,
 *   size: 20,
 *   sortBy: 'lastVisitDate',
 *   sortDir: 'DESC',
 *   namePatient: 'Nguyen'
 * });
 */
export function usePatientsList(params: GetPatientsListParams) {
  return useQuery({
    // Unique query key including all params for proper cache segmentation
    queryKey: ['patients-list', params],

    // Query function to fetch data
    queryFn: () => getPatientsListByDoctorId(params),

    // Extract data from API response wrapper
    select: (response) => response.data,

    // Only fetch if doctorId exists (prevents unnecessary API calls)
    enabled: !!params.doctorId,

    // Retry once on failure
    retry: 1,

    // Cache strategy
    staleTime: 30 * 1000, // 30 seconds - data is considered fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes - cache is kept for 5 minutes

    // Automatic refetch behavior
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

/**
 * Type export for hook return value
 */
export type UsePatientsListResult = ReturnType<typeof usePatientsList>;

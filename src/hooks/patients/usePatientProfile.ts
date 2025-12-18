/**
 * React Query Hook for Patient Profile
 * Fetches and caches patient profile details
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getPatientProfile } from '@/lib/api/patients';

/**
 * Custom hook to fetch patient profile
 *
 * @param doctorId - Doctor's user ID (UUID)
 * @param patientId - Patient's user ID (UUID)
 * @returns React Query result with patient profile data, loading state, and error
 *
 * @example
 * const { data, isLoading, error } = usePatientProfile('DOC123', 'PAT456');
 */
export function usePatientProfile(doctorId: string, patientId: string) {
  return useQuery({
    // Unique query key including doctorId and patientId for proper cache segmentation
    queryKey: ['patient-profile', doctorId, patientId],

    // Query function to fetch data
    queryFn: () => getPatientProfile(doctorId, patientId),

    // Extract data from API response wrapper
    select: (response) => response.data,

    // Only fetch if both doctorId and patientId exist
    enabled: !!doctorId && !!patientId,

    // Retry once on failure
    retry: 1,

    // Cache strategy - profile data doesn't change often
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 min
    gcTime: 10 * 60 * 1000, // 10 minutes - cache is kept for 10 min

    // Automatic refetch behavior
    refetchOnWindowFocus: false, // Don't refetch on window focus (profile is stable)
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

/**
 * Type export for hook return value
 */
export type UsePatientProfileResult = ReturnType<typeof usePatientProfile>;

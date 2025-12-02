/**
 * React Query Hook for Medical History
 * Fetches and caches patient's medical history for doctor view
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getMedicalHistoryByDoctor, type GetMedicalHistoryParams } from '@/lib/api/medical-records';

/**
 * Custom hook to fetch patient's medical history
 * Used for Tab 3 (Consultations) and Tab 4 (Treatment Plan)
 *
 * @param params - Query parameters (doctorId, patientId, page, size)
 * @returns React Query result with medical history data, loading state, and error
 *
 * @example
 * const { data, isLoading, error } = useMedicalHistory({
 *   doctorId: 'DOC123',
 *   patientId: 'PAT456',
 *   page: 0,
 *   size: 50
 * });
 */
export function useMedicalHistory(params: GetMedicalHistoryParams) {
  return useQuery({
    // Unique query key including all params for proper cache segmentation
    queryKey: ['medical-history', params],

    // Query function to fetch data
    queryFn: () => getMedicalHistoryByDoctor(params),

    // Extract data from API response wrapper
    select: (response) => response.data,

    // Only fetch if both doctorId and patientId exist
    enabled: !!params.doctorId && !!params.patientId,

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
export type UseMedicalHistoryResult = ReturnType<typeof useMedicalHistory>;

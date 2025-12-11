/**
 * React Query hooks for Admin Appointments Management
 */

import { useQuery } from '@tanstack/react-query';
import {
  getAppointmentStatistics,
  getStatsByConsultationType,
  getCompletedAppointmentsByDoctor,
  getAppointmentsByStatus,
} from '@/lib/api/admin/appointments';
import type { DateRangeParams } from '@/types/admin';

/**
 * Hook to fetch appointment statistics
 */
export function useAppointmentStatistics(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'appointments', 'statistics', params],
    queryFn: () => getAppointmentStatistics(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch appointments by consultation type
 */
export function useStatsByConsultationType(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'appointments', 'by-consultation-type', params],
    queryFn: () => getStatsByConsultationType(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch completed appointments by doctor
 */
export function useCompletedAppointmentsByDoctor(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'appointments', 'completed-by-doctor', params],
    queryFn: () => getCompletedAppointmentsByDoctor(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch appointments by status
 */
export function useAppointmentsByStatus(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'appointments', 'by-status', params],
    queryFn: () => getAppointmentsByStatus(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * React Query hooks for Admin Revenue Management
 */

import { useQuery } from '@tanstack/react-query';
import {
  getRevenueOverview,
  getRevenueByTime,
  getRevenueByDoctor,
  getRevenueBySpecialty,
  getRevenueByServiceType,
  getTopPerformers,
} from '@/lib/api/admin/revenue';
import type { DateRangeParams, RevenueByDoctorParams, TopPerformersParams } from '@/types/admin';

/**
 * Hook to fetch revenue overview
 */
export function useRevenueOverview(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'revenue', 'overview', params],
    queryFn: () => getRevenueOverview(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by time
 */
export function useRevenueByTime(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'revenue', 'by-time', params],
    queryFn: () => getRevenueByTime(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by specialty
 */
export function useRevenueBySpecialty(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'revenue', 'by-specialty', params],
    queryFn: () => getRevenueBySpecialty(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by service type
 */
export function useRevenueByServiceType(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'revenue', 'by-service-type', params],
    queryFn: () => getRevenueByServiceType(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by doctor (paginated)
 */
export function useRevenueByDoctor(params: RevenueByDoctorParams) {
  return useQuery({
    queryKey: ['admin', 'revenue', 'by-doctor', params],
    queryFn: () => getRevenueByDoctor(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch top performers
 */
export function useTopPerformers(params: TopPerformersParams) {
  return useQuery({
    queryKey: ['admin', 'revenue', 'top-performers', params],
    queryFn: () => getTopPerformers(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

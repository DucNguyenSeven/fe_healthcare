/**
 * React Query hooks for Admin Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/lib/api/admin/dashboard';
import {
  getRevenueByTime,
  getRevenueByDoctor,
  getRevenueBySpecialty,
  getRevenueByServiceType,
} from '@/lib/api/admin/revenue';
import type {
  DashboardResponse,
  RevenueByDateResponse,
  PaginatedRevenueByDoctor,
  SpecialtyRevenueResponse,
  ServiceTypeRevenueResponse,
  DateRangeParams
} from '@/types/admin';

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

/**
 * Hook to fetch revenue by time
 */
export function useRevenueByTime(params: DateRangeParams) {
  return useQuery<RevenueByDateResponse[]>({
    queryKey: ['admin', 'revenue', 'by-time', params],
    queryFn: () => getRevenueByTime(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by doctor
 */
export function useRevenueByDoctor(params: DateRangeParams) {
  return useQuery<PaginatedRevenueByDoctor>({
    queryKey: ['admin', 'revenue', 'by-doctor', params],
    queryFn: () => getRevenueByDoctor(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by specialty
 */
export function useRevenueBySpecialty(params: DateRangeParams) {
  return useQuery<SpecialtyRevenueResponse[]>({
    queryKey: ['admin', 'revenue', 'by-specialty', params],
    queryFn: () => getRevenueBySpecialty(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by service type
 */
export function useRevenueByServiceType(params: DateRangeParams) {
  return useQuery<ServiceTypeRevenueResponse[]>({
    queryKey: ['admin', 'revenue', 'by-service-type', params],
    queryFn: () => getRevenueByServiceType(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

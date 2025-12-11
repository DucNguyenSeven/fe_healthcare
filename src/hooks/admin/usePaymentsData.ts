/**
 * React Query hooks for Admin Payments Management
 */

import { useQuery } from '@tanstack/react-query';
import {
  getRevenueStatistics,
  getRevenueByDate,
  getPaidPayments,
  getPaymentsByStatus,
} from '@/lib/api/admin/payments';
import type { DateRangeParams } from '@/types/admin';

/**
 * Hook to fetch revenue statistics
 */
export function usePaymentStatistics(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'payments', 'statistics', params],
    queryFn: () => getRevenueStatistics(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch revenue by date
 */
export function useRevenueByDate(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'payments', 'revenue-by-date', params],
    queryFn: () => getRevenueByDate(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch paid payments
 */
export function usePaidPayments(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'payments', 'paid', params],
    queryFn: () => getPaidPayments(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch payments by status
 */
export function usePaymentsByStatus(params: DateRangeParams) {
  return useQuery({
    queryKey: ['admin', 'payments', 'by-status', params],
    queryFn: () => getPaymentsByStatus(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

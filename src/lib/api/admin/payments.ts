/**
 * Admin Payment Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 5
 */

import api from '../client';
import type {
  RevenueStatistics,
  PaymentByDate,
  Payment,
  DateRangeParams,
} from '@/types/admin';

/**
 * Get Revenue Statistics
 * Endpoint: GET /api/v1/admin/payments/statistics
 */
export async function getRevenueStatistics(
  params: DateRangeParams
): Promise<RevenueStatistics> {
  const response = await api.get<RevenueStatistics>(
    '/api/v1/admin/payments/statistics',
    { params }
  );
  return response.data;
}

/**
 * Get Revenue By Date
 * Endpoint: GET /api/v1/admin/payments/revenue-by-date
 */
export async function getRevenueByDate(
  params: DateRangeParams
): Promise<PaymentByDate[]> {
  const response = await api.get<PaymentByDate[]>(
    '/api/v1/admin/payments/revenue-by-date',
    { params }
  );
  return response.data;
}

/**
 * Get Payments By Appointments
 * Endpoint: POST /api/v1/admin/payments/by-appointments
 */
export async function getPaymentsByAppointments(
  appointmentIds: string[]
): Promise<Payment[]> {
  const response = await api.post<Payment[]>(
    '/api/v1/admin/payments/by-appointments',
    { appointmentIds }
  );
  return response.data;
}

/**
 * Get Paid Payments By Date Range
 * Endpoint: GET /api/v1/admin/payments/paid-by-date-range
 */
export async function getPaidPayments(
  params: DateRangeParams
): Promise<Payment[]> {
  const response = await api.get<Payment[]>(
    '/api/v1/admin/payments/paid-by-date-range',
    { params }
  );
  return response.data;
}

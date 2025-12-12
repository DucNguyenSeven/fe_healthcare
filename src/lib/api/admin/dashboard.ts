/**
 * Admin Dashboard API Client
 * Endpoint: GET /api/v1/admin/dashboard
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md
 */

import api from '../client';
import type { DashboardResponse, PaginatedRevenueByDoctor, RevenueByDateResponse, ServiceTypeRevenueResponse, SpecialtyRevenueResponse } from '@/types/admin';

export interface DateRangeParams {
  startDate: string; // ISO DateTime format
  endDate: string;   // ISO DateTime format
}

/**
 * Get Dashboard Overview
 *
 * @returns Dashboard data including statistics, charts, and recent activities
 */
export async function getDashboardOverview(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/api/v1/admin/dashboard');
  return response.data;
}
export async function getRevenueByTime(params: DateRangeParams): Promise<RevenueByDateResponse[]> {
  const response = await api.get<RevenueByDateResponse[]>('/api/v1/admin/revenue/by-time', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
  return response.data;
}
export async function getRevenueByDoctor(params: DateRangeParams): Promise<PaginatedRevenueByDoctor> {
  const response = await api.get<PaginatedRevenueByDoctor>('/api/v1/admin/revenue/by-doctor', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
  return response.data;
}
export async function getRevenueBySpecialty(params: DateRangeParams): Promise<SpecialtyRevenueResponse[]> {
  const response = await api.get<SpecialtyRevenueResponse[]>('/api/v1/admin/revenue/by-specialty', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
  return response.data;
}
export async function getRevenueByServiceType(params: DateRangeParams): Promise<ServiceTypeRevenueResponse[]> {
  const response = await api.get<ServiceTypeRevenueResponse[]>('/api/v1/admin/revenue/by-service-type', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
  return response.data;
}


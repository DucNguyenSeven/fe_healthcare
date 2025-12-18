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


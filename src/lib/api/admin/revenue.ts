/**
 * Admin Revenue Management API Client
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md - Section 2
 */

import api from '../client';
import type {
  RevenueOverview,
  RevenueByTimeItem,
  PaginatedRevenueByDoctor,
  SpecialtyRevenueResponse,
  ServiceTypeRevenueResponse,
  RevenueByDoctor,
  DateRangeParams,
  RevenueByDoctorParams,
  TopPerformersParams,
} from '@/types/admin';

/**
 * Get Revenue Overview
 * Endpoint: GET /api/v1/admin/revenue/overview
 */
export async function getRevenueOverview(
  params: DateRangeParams
): Promise<RevenueOverview> {
  const response = await api.get<RevenueOverview>('/api/v1/admin/revenue/overview', {
    params,
  });
  return response.data;
}

/**
 * Get Revenue By Time (Daily Breakdown)
 * Endpoint: GET /api/v1/admin/revenue/by-time
 */
export async function getRevenueByTime(
  params: DateRangeParams
): Promise<RevenueByTimeItem[]> {
  const response = await api.get<RevenueByTimeItem[]>('/api/v1/admin/revenue/by-time', {
    params,
  });
  return response.data;
}

/**
 * Get Revenue By Doctor (Paginated)
 * Endpoint: GET /api/v1/admin/revenue/by-doctor
 */
export async function getRevenueByDoctor(
  params: RevenueByDoctorParams
): Promise<PaginatedRevenueByDoctor> {
  const response = await api.get<PaginatedRevenueByDoctor>('/api/v1/admin/revenue/by-doctor', {
    params,
  });
  return response.data;
}

/**
 * Get Revenue By Specialty
 * Endpoint: GET /api/v1/admin/revenue/by-specialty
 */
export async function getRevenueBySpecialty(
  params: DateRangeParams
): Promise<SpecialtyRevenueResponse[]> {
  const response = await api.get<SpecialtyRevenueResponse[]>('/api/v1/admin/revenue/by-specialty', {
    params,
  });
  return response.data;
}

/**
 * Get Revenue By Service Type
 * Endpoint: GET /api/v1/admin/revenue/by-service-type
 */
export async function getRevenueByServiceType(
  params: DateRangeParams
): Promise<ServiceTypeRevenueResponse[]> {
  const response = await api.get<ServiceTypeRevenueResponse[]>('/api/v1/admin/revenue/by-service-type', {
    params,
  });
  return response.data;
}

/**
 * Get Top Performers
 * Endpoint: GET /api/v1/admin/revenue/top-performers
 */
export async function getTopPerformers(
  params: TopPerformersParams
): Promise<RevenueByDoctor[]> {
  const response = await api.get<RevenueByDoctor[]>('/api/v1/admin/revenue/top-performers', {
    params,
  });
  return response.data;
}

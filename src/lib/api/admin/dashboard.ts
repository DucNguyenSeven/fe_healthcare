/**
 * Admin Dashboard API Client
 * Endpoint: GET /api/v1/admin/dashboard
 * Docs: /docs/ADMIN_API_DOCUMENTATION.md
 */

import type { DashboardResponse } from '@/types/admin';

// Mock data - sẽ replace với axios call thật khi tích hợp backend
const mockDashboardData: DashboardResponse = {
  statistics: {
    totalRevenueThisMonth: 150000000,
    totalAppointmentsThisMonth: 245,
    totalActiveUsers: 1250,
    growthRate: 12.5,
  },
  charts: {
    revenueTrend: [
      { date: '2025-12-01', revenue: 5000000 },
      { date: '2025-12-02', revenue: 5500000 },
      { date: '2025-12-03', revenue: 4800000 },
      { date: '2025-12-04', revenue: 6200000 },
      { date: '2025-12-05', revenue: 5900000 },
      { date: '2025-12-06', revenue: 6500000 },
      { date: '2025-12-07', revenue: 7200000 },
    ],
    appointmentsByStatus: {
      COMPLETED: 180,
      CONFIRMED: 45,
      CANCELLED: 20,
    },
    topDoctors: [
      {
        doctorId: 'DOC001',
        doctorName: 'Dr. Nguyễn Văn A',
        specialty: 'Nội khoa',
        totalRevenue: 25000000,
        appointmentCount: 45,
        rating: 4.8,
      },
      {
        doctorId: 'DOC002',
        doctorName: 'Dr. Trần Thị B',
        specialty: 'Tim mạch',
        totalRevenue: 22000000,
        appointmentCount: 38,
        rating: 4.9,
      },
      {
        doctorId: 'DOC003',
        doctorName: 'Dr. Lê Văn C',
        specialty: 'Ngoại khoa',
        totalRevenue: 20000000,
        appointmentCount: 35,
        rating: 4.7,
      },
      {
        doctorId: 'DOC004',
        doctorName: 'Dr. Phạm Thị D',
        specialty: 'Sản phụ khoa',
        totalRevenue: 18000000,
        appointmentCount: 32,
        rating: 4.6,
      },
      {
        doctorId: 'DOC005',
        doctorName: 'Dr. Hoàng Văn E',
        specialty: 'Nhi khoa',
        totalRevenue: 17000000,
        appointmentCount: 30,
        rating: 4.8,
      },
    ],
    revenueByServiceType: {
      VIDEO_CALL: 80000000,
      IN_PERSON: 70000000,
    },
  },
  recentActivities: {
    recentUsers: [],
    recentAppointments: [],
    recentPayments: [],
  },
};

/**
 * Get Dashboard Overview
 *
 * @returns Dashboard data including statistics, charts, and recent activities
 *
 * TODO: Replace với real API call:
 * ```typescript
 * import { apiClient } from '@/lib/api/client';
 *
 * export async function getDashboardOverview(): Promise<DashboardResponse> {
 *   const response = await apiClient.get<DashboardResponse>('/api/v1/admin/dashboard');
 *   return response.data;
 * }
 * ```
 */
export async function getDashboardOverview(): Promise<DashboardResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return mockDashboardData;
}

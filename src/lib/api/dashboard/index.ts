/**
 * Dashboard API Service
 * Handles API calls for doctor dashboard data
 */

import api from '../client';
import type { DoctorDashboardApiResponse } from '@/types/doctor-dashboard';

/**
 * Dashboard API Class
 * Provides methods to fetch dashboard data for doctors
 */
export class DashboardAPI {
  /**
   * Get doctor dashboard data
   *
   * @param doctorId - Doctor's user ID (UUID)
   * @param date - Optional date in YYYY-MM-DD format (defaults to today if not provided)
   * @returns Promise<DoctorDashboardApiResponse> - Dashboard data with statistics, appointments, and patients
   *
   * @example
   * // Get dashboard for today
   * const data = await DashboardAPI.getDoctorDashboard('7a4a34f4-51ed-4e7f-89f6-a79ced8dd1b3');
   *
   * @example
   * // Get dashboard for specific date
   * const data = await DashboardAPI.getDoctorDashboard('7a4a34f4-51ed-4e7f-89f6-a79ced8dd1b3', '2025-11-24');
   */
  static async getDoctorDashboard(
    doctorId: string,
    date?: string
  ): Promise<DoctorDashboardApiResponse> {
    try {
      // Build query params
      const params = date ? { date } : {};

      // Make API request
      const response = await api.get<DoctorDashboardApiResponse>(
        `/api/v1/dashboard/doctor/${doctorId}`,
        { params }
      );

      return response.data;

    } catch (error: any) {

      // Re-throw error for React Query to handle
      throw error;
    }
  }
}

/**
 * Export individual methods for convenience
 */
export const getDoctorDashboard = DashboardAPI.getDoctorDashboard;

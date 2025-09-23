import { useState, useCallback } from 'react';
import api from '@/lib/api/client';
import { AppointmentResponse, PagedAppointmentResponse } from './usePatientAppointments';

interface AppointmentFilterApiResponse {
  data: PagedAppointmentResponse;
  message: string;
  success: boolean;
}

interface GetAppointmentFilterParams {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REJECTED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED';
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

/**
 * Hook để lấy danh sách appointments với filter theo status
 */
export const useAppointmentFilter = () => {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAppointments = useCallback(async (params: GetAppointmentFilterParams) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 0).toString(),
        size: (params.size || 10).toString(),
        sortBy: params.sortBy || 'createdAt',
        sortDir: params.sortDir || 'DESC'
      });

      // Thêm status nếu có
      if (params.status) {
        queryParams.append('status', params.status);
      }

      const response = await api.get<AppointmentFilterApiResponse>(
        `/api/v1/appointments/filter?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        setAppointments(response.data.data.content);
        setTotalElements(response.data.data.totalElements);
        setTotalPages(response.data.data.totalPages);
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách cuộc hẹn');
      }
    } catch (error: any) {
      console.error('Error fetching filtered appointments:', error);

      let errorMessage = 'Không thể tải danh sách cuộc hẹn';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setAppointments([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setAppointments([]);
    setLoading(false);
    setError(null);
    setTotalElements(0);
    setTotalPages(0);
  }, []);

  return {
    appointments,
    loading,
    error,
    totalElements,
    totalPages,
    fetchAppointments,
    clearError,
    reset
  };
};
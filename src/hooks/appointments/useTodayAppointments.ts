import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';
import type { GetTodayAppointmentsResponse, TodayAppointment } from '@/types/dashboard';
import { format } from 'date-fns';

/**
 * Hook để lấy lịch hẹn hôm nay của bệnh nhân
 */
export function useTodayAppointments(patientId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'today', patientId],
    queryFn: async (): Promise<TodayAppointment[]> => {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      // Tính toán ngày hôm nay (format: yyyy-MM-dd)
      const today = format(new Date(), 'yyyy-MM-dd');

      const queryParams = new URLSearchParams({
        patientId: patientId,
        page: '0',
        size: '10',
        startTime: today,
        endTime: today,
        sortBy: 'appointmentDate',
        sortDir: 'ASC'
      });

      const response = await api.get<GetTodayAppointmentsResponse>(
        `/api/v1/appointments/get-appointment-with-patientId?${queryParams.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.content;
      } else {
        throw new Error(response.data.message || 'Không thể tải lịch hẹn hôm nay');
      }
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 phút
    refetchInterval: 5 * 60 * 1000, // Refetch mỗi 5 phút để cập nhật trạng thái
    retry: 2
  });
}

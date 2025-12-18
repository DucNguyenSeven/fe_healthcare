import { useState, useCallback } from 'react';
import { updateAppointmentStatus, getAppointmentDetail } from '@/lib/api/appointments';
import { webSocketAppointmentService } from '@/services/websocket-appointment';
import { toast } from 'sonner';
import { useGetMe } from '@/hooks/auth/useGetMe';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED';

export interface UpdateStatusOptions {
  patientId?: string;
  doctorId?: string;
}

export interface UseUpdateAppointmentStatusReturn {
  updateStatus: (
    appointmentId: string,
    status: AppointmentStatus,
    rejectReason?: string,
    options?: UpdateStatusOptions
  ) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook để cập nhật trạng thái appointment (dành cho doctor)
 */
export const useUpdateAppointmentStatus = (): UseUpdateAppointmentStatusReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: me } = useGetMe();

  const handleUpdateStatus = useCallback(async (
    appointmentId: string,
    status: AppointmentStatus,
    rejectReason?: string,
    options?: UpdateStatusOptions
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateAppointmentStatus(appointmentId, status);

      if (response.success) {
        // NOTE: We do NOT send WebSocket event from frontend after REST API call.
        // The backend automatically broadcasts WebSocket events to all relevant clients
        // after successfully updating the appointment status in the database.
        // Sending a WebSocket event here would cause a duplicate update attempt,
        // resulting in an error: "Không thể cập nhật trạng thái lịch hẹn"
        // This is similar to the fix in commit 24fe262 for medical record completion.

        // Show success toast based on status
        switch (status) {
          case 'CONFIRMED':
            toast.success('Đã xác nhận lịch hẹn', {
              description: 'Bệnh nhân sẽ nhận được thông báo',
              duration: 4000
            });
            break;
          case 'REJECTED':
            toast.success('Đã từ chối lịch hẹn', {
              description: rejectReason || 'Bệnh nhân sẽ nhận được thông báo',
              duration: 4000
            });
            break;
          case 'COMPLETED':
            toast.success('Đã hoàn thành lịch hẹn', {
              description: 'Kết quả khám đã được lưu',
              duration: 4000
            });
            break;
          case 'CANCELED':
            toast.success('Đã hủy lịch hẹn', {
              description: 'Lịch hẹn đã được hủy',
              duration: 4000
            });
            break;
          default:
            toast.success('Cập nhật trạng thái thành công', {
              duration: 4000
            });
        }

        return true;
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật trạng thái';
      setError(errorMessage);

      toast.error('Cập nhật thất bại', {
        description: errorMessage,
        duration: 5000
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateStatus: handleUpdateStatus,
    loading,
    error,
    clearError
  };
};

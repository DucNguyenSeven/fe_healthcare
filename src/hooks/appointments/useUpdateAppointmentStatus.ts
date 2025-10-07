import { useState, useCallback } from 'react';
import { updateAppointmentStatus, getAppointmentDetail } from '@/lib/api/appointments';
import { webSocketAppointmentService } from '@/services/websocket-appointment';
import { toast } from 'sonner';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW' | 'RESCHEDULED';

export interface UseUpdateAppointmentStatusReturn {
  updateStatus: (appointmentId: string, status: AppointmentStatus, rejectReason?: string) => Promise<boolean>;
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

  const handleUpdateStatus = useCallback(async (
    appointmentId: string,
    status: AppointmentStatus,
    rejectReason?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateAppointmentStatus(appointmentId, status);

      if (response.success) {
        // Send WebSocket event after successful update
        try {
          // Get appointment details to extract patientId and doctorId
          const appointmentDetail = await getAppointmentDetail(appointmentId);

          webSocketAppointmentService.sendScheduleEvent({
            appointmentId: appointmentId,
            patientId: appointmentDetail.patientId,
            doctorId: appointmentDetail.doctorId,
            event: 'UPDATE_APPOINTMENT_STATUS',
            createAppointmentRequest: {
              status: status,
              rejectReason: rejectReason
            }
          });
        } catch (wsError) {
          console.error('[useUpdateAppointmentStatus] Failed to send WebSocket event:', wsError);
          // Don't fail the update if WebSocket fails
        }

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

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
        // Send WebSocket event after successful update
        try {
          let patientId = options?.patientId;
          let doctorId = options?.doctorId;

          // Only fetch appointment detail if patientId or doctorId are not provided
          if (!patientId || !doctorId) {
            console.log('[useUpdateAppointmentStatus] Fetching appointment detail for missing IDs...');
            const appointmentDetail = await getAppointmentDetail(appointmentId);
            patientId = patientId || appointmentDetail.patientId;
            doctorId = doctorId || appointmentDetail.doctorId;
          } else {
            console.log('[useUpdateAppointmentStatus] Using provided patientId and doctorId, skipping getAppointmentDetail');
          }

          webSocketAppointmentService.sendScheduleEvent({
            appointmentId: appointmentId,
            patientId: patientId,
            doctorId: doctorId,
            event: 'UPDATE_APPOINTMENT_STATUS',
            createAppointmentRequest: {
              status: status,
              rejectReason: rejectReason
            },
            // Skip refetch for current user since they will refetch manually after this call
            skipRefetchForUserId: me?.userId
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
  }, [me?.userId]);

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

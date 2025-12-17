import { useState, useCallback } from 'react';
import { bookingAppointment, BookingAppointmentRequest, BookingAppointmentResponse } from '@/lib/api/appointments';
import { webSocketAppointmentService } from '@/services/websocket-appointment';
import { useGetMe } from '@/hooks/auth/useGetMe';

export interface UseBookingAppointmentReturn {
  bookingAppointment: (data: BookingAppointmentRequest) => Promise<BookingAppointmentResponse | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook để xử lý đặt lịch khám
 */
export const useBookingAppointment = (): UseBookingAppointmentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { data: me } = useGetMe();

  const handleBookingAppointment = useCallback(async (data: BookingAppointmentRequest): Promise<BookingAppointmentResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // ✅ DUAL MODE SUPPORT:
      // - CASH: WebSocket booking (original flow) - immediate doctor notification
      // - ONLINE: REST API booking (new flow) - notification after payment succeeds
      const paymentMethod = data.payment_method || 'CASH'; // Default to CASH for backward compatibility

      if (paymentMethod === 'CASH') {
        // ========== CASH FLOW: WebSocket Booking (Keep Original) ==========
        try {
          // Check WebSocket connection first
          if (!webSocketAppointmentService.isConnected()) {
            throw new Error('WebSocket chưa kết nối. Vui lòng kiểm tra kết nối internet.');
          }

          const wsEvent = {
            appointmentId: null, // ← null vì chưa tạo, backend sẽ tạo mới
            patientId: data.patientId,
            doctorId: data.doctorId,
            event: 'BOOKING_APPOINTMENT' as const,
            hasPredict: data.hasPredict || false,
            createAppointmentRequest: data, // ← Backend sẽ tạo appointment từ đây
            skipRefetchForUserId: me?.userId // Skip refetch for patient who just booked
          };

          webSocketAppointmentService.sendScheduleEvent(wsEvent);

          setSuccess(true);

          // Return null vì không có response ngay lập tức
          // WebSocketAppointmentContext sẽ nhận response và hiển thị toast
          return null;
        } catch (wsError: any) {
          throw new Error(wsError.message || 'Không thể gửi yêu cầu đặt lịch qua WebSocket');
        }
      } else {
        // ========== ONLINE FLOW: REST API Booking (New) ==========
        const response = await bookingAppointment(data);

        setSuccess(true);

        // Return appointment data for payment creation
        return response.data;
      }
    } catch (err: any) {
      // Extract detailed error information
      const errorMessage = err.message || 'Có lỗi xảy ra khi đặt lịch khám';

      setError(errorMessage);

      // Re-throw error để caller (AppointmentsPage) có thể handle
      const enhancedError = new Error(errorMessage) as any;
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [me?.userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    bookingAppointment: handleBookingAppointment,
    loading,
    error,
    success,
    clearError,
    reset
  };
};

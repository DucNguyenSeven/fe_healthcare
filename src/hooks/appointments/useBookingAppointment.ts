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
      console.log('🔍 [useBookingAppointment] Starting appointment booking:', data);
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await bookingAppointment(data);
      console.log('🔍 [useBookingAppointment] Received response from API:', response);

      // Kiểm tra cả success và status để tương thích với cả hai format
      if ((response.success === true || response.status === 'success') && response.data) {
        console.log('✅ [useBookingAppointment] Booking successful, preparing to send WebSocket event');
        setSuccess(true);

        // Send WebSocket event after successful booking
        try {
          const wsEvent = {
            appointmentId: response.data.appointmentId || null,
            patientId: data.patientId,
            doctorId: data.doctorId,
            event: 'BOOKING_APPOINTMENT' as const,
            hasPredict: data.hasPredict || false, // ✅ Add hasPredict at top level for backend to parse easily
            createAppointmentRequest: data,
            skipRefetchForUserId: me?.userId // Skip refetch for patient who just booked
          };
          console.log('🔍 [useBookingAppointment] Sending WebSocket event:', wsEvent);
          console.log('🔍🔍🔍 [DEBUG - WebSocket] hasPredict value:', {
            hasPredict: wsEvent.hasPredict,
            hasPredictType: typeof wsEvent.hasPredict,
            fromRequestData: data.hasPredict,
            skipRefetchForUserId: me?.userId
          });
          webSocketAppointmentService.sendScheduleEvent(wsEvent);
          console.log('✅ [useBookingAppointment] WebSocket event sent successfully');
        } catch (wsError) {
          console.error('❌ [useBookingAppointment] Failed to send WebSocket event:', wsError);
          // Don't fail the booking if WebSocket fails
        }

        return response.data;
      } else {
        throw new Error(response.message || 'Không thể đặt lịch khám');
      }
    } catch (err: any) {
      // Extract detailed error information
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đặt lịch khám';
      const statusCode = err.response?.status;

      console.error('❌ [useBookingAppointment] Booking failed:', {
        message: errorMessage,
        statusCode,
        fullError: err
      });

      setError(errorMessage);

      // Re-throw error để caller (AppointmentsPage) có thể handle cụ thể
      // Attach thêm status code để caller biết loại error
      const enhancedError = new Error(errorMessage) as any;
      enhancedError.response = err.response;
      enhancedError.statusCode = statusCode;
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

import { useState, useCallback } from 'react';
import { bookingAppointment, BookingAppointmentRequest, BookingAppointmentResponse } from '@/lib/api/appointments';
import { webSocketAppointmentService } from '@/services/websocket-appointment';

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
            createAppointmentRequest: data
          };
          console.log('🔍 [useBookingAppointment] Sending WebSocket event:', wsEvent);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt lịch khám';
      console.error('❌ [useBookingAppointment] Booking failed:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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

import { useState, useCallback } from 'react';
import { bookingAppointment, BookingAppointmentRequest, BookingAppointmentResponse } from '@/lib/api/appointments';

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
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await bookingAppointment(data);
      
      // Kiểm tra cả success và status để tương thích với cả hai format
      if ((response.success === true || response.status === 'success') && response.data) {
        setSuccess(true);
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể đặt lịch khám');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi đặt lịch khám';
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

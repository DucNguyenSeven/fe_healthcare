import { useCallback, useState } from 'react';
import { getDoctorAppointmentsInWeek, AppointmentWeekFilterResponse } from '@/lib/api/appointments';

export interface UseDoctorAppointmentsParams {
  doctorId: string;
  startTime: string; // YYYY-MM-DD (tuần bắt đầu)
  endTime: string;   // YYYY-MM-DD (tuần kết thúc)
}

export const useDoctorAppointments = () => {
  const [appointments, setAppointments] = useState<AppointmentWeekFilterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorAppointments = useCallback(async (params: UseDoctorAppointmentsParams) => {
    setLoading(true);
    setError(null);
    try {
      // Debug params
      // eslint-disable-next-line no-console
      console.log('[useDoctorAppointments] fetch params:', params);
      const res = await getDoctorAppointmentsInWeek(params);
      // Debug raw response
      // eslint-disable-next-line no-console
      console.log('[useDoctorAppointments] response:', res);
      if (res.success) {
        setAppointments(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải lịch hẹn của bác sĩ');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đã có lỗi xảy ra';
      // eslint-disable-next-line no-console
      console.error('[useDoctorAppointments] error:', msg, err);
      setError(msg);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setAppointments([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchDoctorAppointments,
    clearError,
    reset,
  };
};



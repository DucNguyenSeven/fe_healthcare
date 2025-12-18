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
      const res = await getDoctorAppointmentsInWeek(params);
      if (res.success) {
        setAppointments(res.data || []);
      } else {
        throw new Error(res.message || 'Không thể tải lịch hẹn của bác sĩ');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Đã có lỗi xảy ra';
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



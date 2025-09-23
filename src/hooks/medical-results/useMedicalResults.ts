import { useState, useCallback } from 'react';
import {
  getMedicalResultsByAppointment,
  MedicalResultsData
} from '@/lib/api/medical-results';

export const useMedicalResultsByAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MedicalResultsData | null>(null);

  const fetchMedicalResults = useCallback(async (appointmentId: string): Promise<MedicalResultsData | null> => {
    if (!appointmentId) {
      setError('ID cuộc hẹn không hợp lệ');
      return null;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await getMedicalResultsByAppointment(appointmentId);

      if (response.success && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể lấy kết quả khám');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi lấy kết quả khám';
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
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    fetchMedicalResults,
    loading,
    error,
    data,
    clearError,
    reset,
  };
};
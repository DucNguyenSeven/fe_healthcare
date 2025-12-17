import { useState } from 'react';
import { getPredict, GetPredictResponse, PredictData } from '@/lib/api/predict';

export interface UseGetPredictReturn {
  data: PredictData | null;
  loading: boolean;
  error: string | null;
  fetchPredict: (patientId: string) => Promise<void>;
  clearError: () => void;
}

export const useGetPredict = (): UseGetPredictReturn => {
  const [data, setData] = useState<PredictData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredict = async (patientId: string) => {
    if (!patientId) {
      setError('Patient ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: GetPredictResponse = await getPredict(patientId);

      if (response.success && response.data) {
        setData(response.data);
      } else {
        // Không có dữ liệu predict - không phải là lỗi
        setData(null);
      }
    } catch (err: any) {
      console.error('❌ [useGetPredict] Error fetching predict:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu dự đoán');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    data,
    loading,
    error,
    fetchPredict,
    clearError
  };
};

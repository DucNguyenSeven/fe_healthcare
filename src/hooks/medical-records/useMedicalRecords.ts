import { useState, useCallback } from 'react';
import {
  createMedicalRecord,
  CreateMedicalRecordRequest,
  CreateMedicalRecordResponse
} from '@/lib/api/medical-records';

export const useCreateMedicalRecord = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateMedicalRecordRequest): Promise<CreateMedicalRecordResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await createMedicalRecord(data);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể tạo hồ sơ khám');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tạo hồ sơ khám';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    create,
    loading,
    error,
    clearError,
  };
};
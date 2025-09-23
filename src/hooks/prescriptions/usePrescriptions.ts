import { useState, useCallback } from 'react';
import {
  createPrescription,
  createMultiplePrescriptions,
  CreatePrescriptionRequest,
  CreatePrescriptionResponse
} from '@/lib/api/prescriptions';

export const useCreatePrescription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreatePrescriptionRequest): Promise<CreatePrescriptionResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await createPrescription(data);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể tạo đơn thuốc');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tạo đơn thuốc';
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

export const useCreateMultiplePrescriptions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMultiple = useCallback(async (prescriptions: CreatePrescriptionRequest[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createMultiplePrescriptions(prescriptions);

      // Nếu có failed prescriptions, set warning message
      if (result.failed.length > 0) {
        const failedCount = result.failed.length;
        const totalCount = prescriptions.length;
        const successCount = result.successful.length;

        setError(`Tạo thành công ${successCount}/${totalCount} đơn thuốc. ${failedCount} đơn thuốc thất bại.`);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tạo đơn thuốc';
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
    createMultiple,
    loading,
    error,
    clearError,
  };
};
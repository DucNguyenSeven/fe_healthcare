import { useState, useCallback, useEffect } from 'react';
import {
  createMedicalRecord,
  getMedicalRecordsByPatientId,
  getMedicalRecordById,
  CreateMedicalRecordRequest,
  CreateMedicalRecordResponse
} from '@/lib/api/medical-records';
import type {
  MedicalRecordWithPrescriptions,
  PaginationData,
  GetMedicalRecordsParams
} from '@/types/medical-record';

// ============= CREATE Medical Record Hook (existing) =============
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

// ============= GET Medical Records Hook (new) =============
export const useGetMedicalRecords = (patientId: string | undefined) => {
  const [records, setRecords] = useState<MedicalRecordWithPrescriptions[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (params?: Partial<GetMedicalRecordsParams>) => {
    if (!patientId) {
      setRecords([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMedicalRecordsByPatientId({
        patientId,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sortBy: params?.sortBy ?? 'createdAt',
        order: params?.order ?? 'DESC',
      });

      if (response.success && response.data) {
        setRecords(response.data.records);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Không thể tải danh sách hồ sơ khám');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách hồ sơ khám';
      setError(errorMessage);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // Auto-fetch on mount and when patientId changes
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const refetch = useCallback(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    pagination,
    loading,
    error,
    refetch,
  };
};

// ============= GET Medical Record Detail Hook (new) =============
export const useGetMedicalRecordDetail = () => {
  const [record, setRecord] = useState<MedicalRecordWithPrescriptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async (recordId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMedicalRecordById(recordId);

      if (response.success && response.data) {
        setRecord(response.data);
      } else {
        throw new Error(response.message || 'Không thể tải thông tin hồ sơ khám');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải thông tin hồ sơ khám';
      setError(errorMessage);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecord = useCallback(() => {
    setRecord(null);
    setError(null);
  }, []);

  return {
    record,
    loading,
    error,
    fetchRecord,
    clearRecord,
  };
};
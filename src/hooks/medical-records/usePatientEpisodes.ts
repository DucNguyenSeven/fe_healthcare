import { useState, useEffect } from 'react';
import {
  getPatientEpisodes,
  type GetMedicalRecordsResponse,
} from '@/lib/api/medical-records';

interface UsePatientEpisodesParams {
  patientId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  autoFetch?: boolean; // Auto fetch on mount/param change (default: true)
}

/**
 * Custom hook for fetching patient episodes (only INITIAL records)
 * Used for displaying clean list of main examination episodes
 */
export const usePatientEpisodes = (params: UsePatientEpisodesParams = {}) => {
  const {
    patientId,
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    order = 'DESC',
    autoFetch = true,
  } = params;

  const [data, setData] = useState<GetMedicalRecordsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch episodes data
   */
  const fetchEpisodes = async (fetchParams?: {
    patientId?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  }) => {
    const finalPatientId = fetchParams?.patientId || patientId;

    if (!finalPatientId) {
      console.warn('[usePatientEpisodes] No patientId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [usePatientEpisodes] Fetching episodes for patient:', finalPatientId);

      const response = await getPatientEpisodes({
        patientId: finalPatientId,
        page: fetchParams?.page ?? page,
        size: fetchParams?.size ?? size,
        sortBy: fetchParams?.sortBy ?? sortBy,
        order: fetchParams?.order ?? order,
      });

      if (response.success && response.data) {
        console.log('🔍 [usePatientEpisodes] Episodes fetched:', {
          totalRecords: response.data.pagination?.totalRecords,
          currentPage: response.data.pagination?.currentPage,
          recordsCount: response.data.records?.length,
        });

        setData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Không thể tải danh sách đợt khám');
        setData(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      console.error('🔍 [usePatientEpisodes] Error:', errorMessage);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-fetch when params change
   */
  useEffect(() => {
    if (autoFetch && patientId) {
      fetchEpisodes();
    }
  }, [patientId, page, size, sortBy, order, autoFetch]);

  /**
   * Manual refetch with same params
   */
  const refetch = () => {
    if (patientId) {
      fetchEpisodes();
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    fetchEpisodes,
    refetch,
    reset,
    // Computed values
    episodes: data?.records || [],
    pagination: data?.pagination,
    totalRecords: data?.pagination?.totalRecords || 0,
    totalPages: data?.pagination?.totalPages || 0,
    hasEpisodes: (data?.records?.length || 0) > 0,
  };
};

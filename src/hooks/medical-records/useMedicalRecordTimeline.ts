import { useState, useEffect } from 'react';
import {
  getMedicalRecordTimeline,
  type MedicalRecordTimelineResponse,
} from '@/lib/api/medical-records';

/**
 * Custom hook for fetching medical record timeline
 * Returns full history from root record to all follow-up records
 * Can be called with any recordId in the chain
 */
export const useMedicalRecordTimeline = (recordId?: string) => {
  const [data, setData] = useState<MedicalRecordTimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch timeline data
   */
  const fetchTimeline = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMedicalRecordTimeline(id);

      if (response.success && response.data) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Không thể tải lịch sử khám');
        setData(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      console.error('🔍 [useMedicalRecordTimeline] Error:', errorMessage);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Auto-fetch when recordId changes
   */
  useEffect(() => {
    if (recordId) {
      fetchTimeline(recordId);
    }
  }, [recordId]);

  /**
   * Manual refetch
   */
  const refetch = () => {
    if (recordId) {
      fetchTimeline(recordId);
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
    fetchTimeline,
    refetch,
    reset,
    // Computed values
    hasFollowUps: (data?.followUpRecords?.length || 0) > 0,
    totalRecords: 1 + (data?.followUpRecords?.length || 0),
  };
};

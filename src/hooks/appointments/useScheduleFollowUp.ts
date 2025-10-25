import { useState } from 'react';
import {
  scheduleFollowUpByDoctor,
  type ScheduleFollowUpByDoctorRequest,
  type ScheduleFollowUpApiResponse,
} from '@/lib/api/appointments';

/**
 * Custom hook for scheduling follow-up appointments by doctor
 * Used when doctor wants to schedule a follow-up appointment after examination
 */
export const useScheduleFollowUp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Schedule a follow-up appointment
   * @param data - Follow-up appointment data
   * @returns Response with appointment details or null if failed
   */
  const scheduleFollowUp = async (
    data: ScheduleFollowUpByDoctorRequest
  ): Promise<ScheduleFollowUpApiResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('🔍 [useScheduleFollowUp] Scheduling follow-up:', data);

      const response = await scheduleFollowUpByDoctor(data);

      console.log('🔍 [useScheduleFollowUp] Success:', response);

      setSuccess(true);
      setLoading(false);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể đặt lịch tái khám';

      console.error('🔍 [useScheduleFollowUp] Error:', errorMessage);

      setError(errorMessage);
      setSuccess(false);
      setLoading(false);
      return null;
    }
  };

  /**
   * Reset hook state
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    scheduleFollowUp,
    loading,
    error,
    success,
    reset,
  };
};

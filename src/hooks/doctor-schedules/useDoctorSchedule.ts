import { useState, useCallback } from 'react';
import { DoctorScheduleApi } from '@/lib/api/schedule';
import { TimeSlot } from '@/lib/api/types';

export interface UseDoctorScheduleReturn {
  timeSlots: string[];
  scheduleId: string;
  timeSlotMapping: { [time: string]: number }; // Map time string to slotId
  loading: boolean;
  error: string | null;
  fetchDoctorSchedule: (doctorId: string, date: string) => Promise<void>;
  refreshAvailableSlots: (doctorId: string, date: string) => Promise<{
    slots: string[];
    mapping: { [time: string]: number };
    scheduleId: string;
  }>;
  clearError: () => void;
}

/**
 * Hook để lấy lịch làm việc của bác sĩ trong ngày cụ thể
 */
export const useDoctorSchedule = (): UseDoctorScheduleReturn => {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [scheduleId, setScheduleId] = useState<string>('');
  const [timeSlotMapping, setTimeSlotMapping] = useState<{ [time: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorSchedule = useCallback(async (doctorId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate date format (yyyy-MM-dd)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd');
      }

      const response = await DoctorScheduleApi.getDoctorScheduleByDate({ doctorId, date });
      
      if (response.success && response.data) {
        // Lưu scheduleId - API trả về field 'scheduleId' chứ không phải 'id'
        const scheduleId = response.data.scheduleId || response.data.id || '';
        setScheduleId(scheduleId);
        
        // Chuyển đổi timeSlots từ API thành array of time strings và tạo mapping
        const slots: string[] = [];
        const mapping: { [time: string]: number } = {};
        
        response.data.timeSlots?.forEach((slot: TimeSlot) => {
          const timeString = slot.startTime.substring(0, 5); // "08:00:00" -> "08:00"
          slots.push(timeString);
          mapping[timeString] = slot.slotId;
        });
        
        setTimeSlots(slots);
        setTimeSlotMapping(mapping);
      } else {
        throw new Error(response.message || 'Không thể lấy lịch làm việc của bác sĩ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy lịch làm việc';
      setError(errorMessage);
      setTimeSlots([]);
      setScheduleId('');
      setTimeSlotMapping({});
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh available time slots để lấy dữ liệu mới nhất
   * Dùng để kiểm tra slot còn available trước khi booking (tránh race condition)
   */
  const refreshAvailableSlots = useCallback(async (doctorId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate date format (yyyy-MM-dd)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd');
      }

      const response = await DoctorScheduleApi.getDoctorScheduleByDate({ doctorId, date });

      if (response.success && response.data) {
        // Lưu scheduleId
        const latestScheduleId = response.data.scheduleId || response.data.id || '';

        setScheduleId(latestScheduleId);

        // Chuyển đổi timeSlots từ API thành array of time strings và tạo mapping
        const slots: string[] = [];
        const mapping: { [time: string]: number } = {};

        response.data.timeSlots?.forEach((slot: TimeSlot) => {
          const timeString = slot.startTime.substring(0, 5); // "08:00:00" -> "08:00"
          slots.push(timeString);
          mapping[timeString] = slot.slotId;
        });

        setTimeSlots(slots);
        setTimeSlotMapping(mapping);

        // Return dữ liệu mới nhất để caller có thể dùng ngay
        return {
          slots,
          mapping,
          scheduleId: latestScheduleId
        };
      } else {
        throw new Error(response.message || 'Không thể lấy lịch làm việc của bác sĩ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi làm mới lịch làm việc';
      setError(errorMessage);
      setTimeSlots([]);
      setScheduleId('');
      setTimeSlotMapping({});
      throw err; // Re-throw để caller có thể handle
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    timeSlots,
    scheduleId,
    timeSlotMapping,
    loading,
    error,
    fetchDoctorSchedule,
    refreshAvailableSlots, // Export function mới
    clearError
  };
};

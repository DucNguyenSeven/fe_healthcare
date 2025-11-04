import { useState, useCallback } from 'react';
import { getDoctorsWithDetailsByDate } from '@/lib/api/doctor-schedules';
import { DoctorInfo } from '@/lib/api/doctors';

export interface UseDoctorOfDateReturn {
  doctors: DoctorInfo[];
  scheduleIdMap: { [doctorId: string]: string };
  loading: boolean;
  error: string | null;
  fetchDoctorsByDate: (date: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook để lấy danh sách bác sĩ có lịch làm việc trong ngày được chỉ định
 */
export const useDoctorOfDate = (): UseDoctorOfDateReturn => {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [scheduleIdMap, setScheduleIdMap] = useState<{ [doctorId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorsByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD');
      }

      // Gọi API mới - Trả về danh sách bác sĩ kèm scheduleId trong 1 lần
      const response = await getDoctorsWithDetailsByDate({ date });

      console.log('🔍 [DEBUG] API Response:', JSON.stringify(response, null, 2));
      console.log('🔍 [DEBUG] Doctors count:', response.data?.length);

      if (response.success && response.data) {
        console.log('🔍 [DEBUG] First doctor data:', response.data[0]);
        // Transform dữ liệu từ DoctorScheduleInfo sang DoctorInfo format
        const doctors: DoctorInfo[] = response.data.map((doc) => ({
          id: doc.doctorId,
          name: doc.fullName,
          specialty: doc.specialty || 'Nội tổng quát',
          rating: doc.rating !== null ? doc.rating : 4.5,
          experience: doc.experienceYears ? `${doc.experienceYears} năm kinh nghiệm` : '5 năm kinh nghiệm',
          avatar: doc.avatarUrl || '/api/placeholder/60/60',
          bio: `Bác sĩ ${doc.specialty}`,
          examinationFee: doc.examinationFee !== null ? doc.examinationFee : undefined,
          clinicAddress: doc.clinicAddress || 'Bệnh viện',
          // Giữ nguyên các field gốc từ API mới
          userId: doc.doctorId,
          fullName: doc.fullName,
          email: doc.email,
          phone: doc.phoneNumber,
          avatarUrl: doc.avatarUrl || undefined, // Convert null to undefined
          experienceYears: doc.experienceYears,
        }));

        // Tạo scheduleId map để dùng sau này
        const scheduleMap: { [doctorId: string]: string } = {};
        response.data.forEach(doc => {
          scheduleMap[doc.doctorId] = doc.scheduleId;
        });

        console.log('✅ [DEBUG] Transformed doctors:', doctors);
        console.log('✅ [DEBUG] First transformed doctor:', doctors[0]);
        console.log('✅ [DEBUG] Schedule ID map:', scheduleMap);

        setDoctors(doctors);
        setScheduleIdMap(scheduleMap);
      } else {
        throw new Error(response.message || 'Không thể lấy danh sách bác sĩ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy danh sách bác sĩ';
      setError(errorMessage);
      setDoctors([]);
      setScheduleIdMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    doctors,
    scheduleIdMap,
    loading,
    error,
    fetchDoctorsByDate,
    clearError
  };
};

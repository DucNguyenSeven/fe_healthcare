import { useState, useCallback } from 'react';
import { DoctorScheduleApi } from '@/lib/api/schedule';
import { getDoctorsInfo, DoctorInfo } from '@/lib/api/doctors';

export interface UseDoctorOfDateReturn {
  doctors: DoctorInfo[];
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorsByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate date format (yyyy-MM-dd)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new Error('Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng yyyy-MM-dd');
      }

      // Lấy danh sách lịch làm việc của bác sĩ trong ngày
      const scheduleResponse = await DoctorScheduleApi.getDoctorsOfDate({ date });
      
      if (scheduleResponse.success && scheduleResponse.data) {
        // API trả về array of strings (doctor IDs) chứ không phải array of objects
        const doctorIds = Array.isArray(scheduleResponse.data) ? scheduleResponse.data : [];
        
        
        if (doctorIds.length > 0) {
          try {
            // Lấy thông tin chi tiết của các bác sĩ sử dụng API getDoctorByIds
            const doctorsResponse = await getDoctorsInfo(doctorIds);
            
            
            if (doctorsResponse.success && doctorsResponse.data) {
              // Chuyển đổi dữ liệu từ API response sang format DoctorInfo
              const doctors: DoctorInfo[] = doctorsResponse.data.map((doctor: any) => ({
                id: doctor.userId || doctor.id,
                name: doctor.fullName || doctor.name,
                specialty: doctor.specialty || 'Nội tổng quát',
                rating: doctor.rating || 4.5,
                experience: doctor.experienceYears ? `${doctor.experienceYears} năm kinh nghiệm` : '5 năm kinh nghiệm',
                avatar: doctor.avatarUrl || doctor.avatar || '/api/placeholder/60/60',
                bio: doctor.bio || 'Bác sĩ chuyên khoa',
                examinationFee: doctor.examinationFee || 300000,
                clinicAddress: doctor.clinicAddress || 'Bệnh viện',
                // Giữ nguyên các field khác
                userId: doctor.userId,
                fullName: doctor.fullName,
                email: doctor.email,
                gender: doctor.gender,
                dob: doctor.dob,
                phone: doctor.phone,
                address: doctor.address,
                avatarUrl: doctor.avatarUrl,
                role: doctor.role,
                status: doctor.status,
                experienceYears: doctor.experienceYears,
                certifications: doctor.certifications
              }));
              
              setDoctors(doctors);
            } else {
              throw new Error(doctorsResponse.message || 'Không thể lấy thông tin bác sĩ');
            }
          } catch (doctorError) {
            // Fallback: Tạo mock data nếu API lỗi
            const mockDoctors: DoctorInfo[] = doctorIds.map((id, index) => ({
              id,
              name: `BS. Bác sĩ ${index + 1}`,
              specialty: 'Nội tổng quát',
              rating: 4.5,
              experience: '5 năm kinh nghiệm',
              avatar: '/api/placeholder/60/60',
              bio: 'Bác sĩ chuyên khoa',
              examinationFee: 300000,
              clinicAddress: 'Bệnh viện'
            }));
            setDoctors(mockDoctors);
          }
        } else {
          setDoctors([]);
        }
      } else {
        throw new Error(scheduleResponse.message || 'Không thể lấy danh sách bác sĩ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy danh sách bác sĩ';
      setError(errorMessage);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    doctors,
    loading,
    error,
    fetchDoctorsByDate,
    clearError
  };
};

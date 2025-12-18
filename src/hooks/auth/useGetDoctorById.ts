'use client';
import { useQuery } from '@tanstack/react-query';
import { getUserIdFromToken } from '@/utils/auth/token';
import { getDoctorById, type DoctorResponse } from '@/lib/api/doctors';
import type { MessageResponse } from '@/lib/api/types';

export function useGetDoctorById() {
  const doctorId = getUserIdFromToken();
  
  return useQuery({
    queryKey: ['doctor', 'byId', doctorId],
    queryFn: async (): Promise<DoctorResponse> => {
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }
      const response: MessageResponse<DoctorResponse> = await getDoctorById(doctorId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi tải thông tin bác sĩ');
      }
    },
    enabled: !!doctorId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}


import { useQuery } from '@tanstack/react-query';
import { getMedicalRecordsByPatientId } from '@/lib/api/medical-records';
import type { MedicalRecordWithPrescriptions } from '@/types/medical-record';

/**
 * Hook để lấy danh sách tư vấn/hồ sơ bệnh án gần đây (5 records)
 */
export function useRecentConsultations(patientId: string | undefined) {
  return useQuery({
    queryKey: ['medical-records', 'recent', patientId],
    queryFn: async (): Promise<MedicalRecordWithPrescriptions[]> => {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      const response = await getMedicalRecordsByPatientId({
        patientId: patientId,
        page: 0,
        size: 5,
        sortBy: 'createdAt',
        order: 'DESC'
      });

      if (response.success && response.data) {
        return response.data.records;
      } else {
        throw new Error(response.message || 'Không thể tải danh sách tư vấn gần đây');
      }
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 phút
    retry: 2
  });
}

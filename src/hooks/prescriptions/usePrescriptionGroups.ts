import { useQuery } from '@tanstack/react-query';
import { getPrescriptionGroups } from '@/lib/api/prescriptions';
import type { PrescriptionGroup } from '@/types/dashboard';

/**
 * Hook để lấy danh sách toa thuốc nhóm theo lần khám
 */
export function usePrescriptionGroups(patientId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', 'groups', patientId],
    queryFn: async (): Promise<PrescriptionGroup[]> => {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      const response = await getPrescriptionGroups(patientId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể tải danh sách toa thuốc');
      }
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 phút
    retry: 2,
    select: (data) => {
      // Sắp xếp: active prescriptions trước, sau đó theo ngày tạo (mới nhất trước)
      return data.sort((a, b) => {
        // Ưu tiên hiển thị toa đang dùng (isActive = true)
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;

        // Nếu cùng trạng thái, sắp xếp theo ngày tạo (mới nhất trước)
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();
        return dateB - dateA;
      });
    }
  });
}

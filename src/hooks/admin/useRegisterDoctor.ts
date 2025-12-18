'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { registerDoctorAccount } from '@/lib/api/admin/doctors';
import { getVietnameseErrorMessage } from '@/utils/errorMessages';

export function useRegisterDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      registerDoctorAccount({
        email,
        password: 'HealthCare@123', // Default password
      }),
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });

      toast.success('Cấp tài khoản bác sĩ thành công!');
    },
    onError: (error: any) => {
      const apiMessage = error?.response?.data?.message || '';
      const vietnameseMessage = getVietnameseErrorMessage(
        apiMessage,
        'Không thể tạo tài khoản. Vui lòng thử lại.'
      );

      toast.error('Tạo tài khoản thất bại', {
        description: vietnameseMessage,
        duration: 4000,
      });
    },
  });
}

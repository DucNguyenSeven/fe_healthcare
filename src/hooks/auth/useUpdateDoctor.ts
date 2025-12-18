import { useState } from 'react';
import { UsersApi } from '@/lib/api/user/users';
import type { UpdateDoctorRequest } from '@/lib/api/types';

export const useUpdateDoctor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDoctor = async (data: UpdateDoctorRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UsersApi.updateDoctor(data);
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật thông tin bác sĩ');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Có lỗi xảy ra khi cập nhật thông tin bác sĩ';
      setError(errorMessage);
      console.error('Update doctor error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateDoctor,
    isLoading,
    error
  };
};

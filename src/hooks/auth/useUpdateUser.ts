import { useState } from 'react';
import { UsersApi } from '@/lib/api/user';
import type { UpdateUserRequest, UserResponse } from '@/lib/api/types';

interface UseUpdateUserReturn {
  updateUser: (data: UpdateUserRequest) => Promise<UserResponse | null>;
  isLoading: boolean;
  error: string | null;
}

export const useUpdateUser = (): UseUpdateUserReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (data: UpdateUserRequest): Promise<UserResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await UsersApi.update(data);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Cập nhật thông tin thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thông tin';
      setError(errorMessage);
      console.error('Lỗi cập nhật thông tin người dùng:', err);
      console.error('Chi tiết lỗi:', {
        message: err instanceof Error ? err.message : 'Lỗi không xác định',
        status: (err as any)?.response?.status,
        statusText: (err as any)?.response?.statusText,
        data: (err as any)?.response?.data
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
    isLoading,
    error,
  };
};

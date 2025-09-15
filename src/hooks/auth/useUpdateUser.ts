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
      let errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string; statusCode?: number } } };
        
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

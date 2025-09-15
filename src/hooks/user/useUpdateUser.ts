import { useState } from 'react';
import { UsersApi, parseApiError } from '@/lib/api';
import type { UpdateUserRequest, User } from '@/lib/api';

interface UseUpdateUserReturn {
  updateUser: (payload: UpdateUserRequest) => Promise<User>;
  loading: boolean;
  error: string | null;
}

export const useUpdateUser = (): UseUpdateUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (payload: UpdateUserRequest): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await UsersApi.update(payload);
      if (response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Cập nhật thông tin thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
};

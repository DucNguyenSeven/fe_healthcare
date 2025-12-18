/**
 * React Query hooks for Admin Users Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getUsers, getUserStatistics, updateUserStatus } from '@/lib/api/admin/users';
import type { UserFilterParams, UpdateUserStatusRequest } from '@/types/admin';

/**
 * Hook to fetch users list with filters and pagination
 */
export function useUsers(params: UserFilterParams) {
  return useQuery({
    queryKey: ['admin', 'users', 'list', params],
    queryFn: () => getUsers(params),
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch user statistics
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: ['admin', 'users', 'statistics'],
    queryFn: getUserStatistics,
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update user status
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateUserStatusRequest }) =>
      updateUserStatus(userId, request),
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Cập nhật trạng thái người dùng thành công');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      toast.error('Lỗi cập nhật', { description: message });
    },
  });
}

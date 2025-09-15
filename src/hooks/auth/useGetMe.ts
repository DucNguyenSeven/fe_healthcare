'use client';
import { useQuery } from '@tanstack/react-query';
import { AuthAPI } from '@/lib/api/user';
import type { GetMeResponse } from '@/types/auth';

export function useGetMe() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => AuthAPI.getMe(),
    select: (data) => data?.data, // Extract data from ApiEnvelope
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

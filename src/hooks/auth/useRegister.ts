'use client';
import { useMutation } from '@tanstack/react-query';
import { AuthAPI } from '@/lib/api/user';
import type { RegisterPayload } from './types';
import { setAccessToken, setRefreshToken } from '@/utils/auth/token';

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => AuthAPI.register(payload),
    onSuccess: (res) => {
      const d = res?.data;
      const at = d?.access_token;
      const rt = d?.refresh_token;
      if (at) setAccessToken(at);
      if (rt) setRefreshToken(rt);
    },
  });
}

'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/user';
import type { LoginPayload } from './types';
import { setAccessToken, setRefreshToken } from '@/utils/auth/token';
import { useAuthContext } from '@/contexts/AuthContext';

export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuthContext();

  return useMutation({
    mutationFn: (payload: LoginPayload) => AuthAPI.login(payload),
    onSuccess: (res) => {
      const d = res?.data;
      const at = d?.accessToken ?? (d as any)?.access_token;
      const rt = d?.refreshToken ?? (d as any)?.refresh_token;

      if (at) setAccessToken(at);
      if (rt) setRefreshToken(rt);

      // Set user data in context
      if (d) {
        const userData = {
          userId: d.userId,
          email: d.email,
          role: d.role,
        };
        setUser(userData);

        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));

        // Store success message for dashboard display
        sessionStorage.setItem('loginSuccessMessage', 'Đăng nhập thành công! Chào mừng bạn quay trở lại.');

        // Redirect to patient dashboard after successful login
        router.push('/patient/dashboard');
      }
    },
  });
}

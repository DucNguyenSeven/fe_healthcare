"use client";

import { useRouter } from 'next/navigation';
import { clearTokens } from '@/utils/auth/token';
import { useAuthContext } from '@/contexts/AuthContext';
import { UseLogoutReturn } from './types';

export function useLogout(): UseLogoutReturn {
  const router = useRouter();
  const { setUser } = useAuthContext();

  const logout = () => {
    // Clear tokens from memory
    clearTokens();

    // Clear user info from localStorage
    localStorage.removeItem('user');

    // Clear user from context
    setUser(null);

    // Store success message for home page display
    sessionStorage.setItem('logoutSuccessMessage', 'Đăng xuất thành công! Hẹn gặp lại bạn.');

    // Redirect to home page
    router.push('/');
  };

  return {
    logout,
  };
}

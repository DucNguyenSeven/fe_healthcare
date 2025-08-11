"use client";

import { useRouter } from 'next/navigation';
import { tokenStore } from '@/utils/auth/token';
import { useUserState } from './useUserState';
import { UseLogoutReturn } from './types';

export function useLogout(): UseLogoutReturn {
  const router = useRouter();
  const { setUser } = useUserState();

  const logout = () => {
    // Clear tokens from memory
    tokenStore.clear();
    
    // Clear user info from localStorage
    localStorage.removeItem('user');
    
    // Clear user from context
    setUser(null);
    
    // Redirect to home page
    router.push('/');
  };

  return {
    logout,
  };
}

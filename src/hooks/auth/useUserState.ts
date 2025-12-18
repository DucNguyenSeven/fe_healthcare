"use client";

import { useAuthContext } from '@/contexts/AuthContext';
import { UseUserStateReturn } from './types';

export function useUserState(): UseUserStateReturn {
  const { user, isAuthenticated, setUser } = useAuthContext();

  const clearUser = () => {
    setUser(null);
  };

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
  };
}

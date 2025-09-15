"use client";

import { useAuthContext } from '@/contexts/AuthContext';
import { UseUserStateReturn } from './types';

export function useUserState(): UseUserStateReturn {
  const { user, isAuthenticated, setUser } = useAuthContext();

  return {
    user,
    isAuthenticated,
    setUser,
  };
}

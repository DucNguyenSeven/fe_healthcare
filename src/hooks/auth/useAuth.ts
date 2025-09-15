"use client";

import { useLogin } from './useLogin';
import { useLogout } from './useLogout';
import { useUserState } from './useUserState';
import { UseAuthReturn } from './types';

export function useAuth(): UseAuthReturn {
  const loginState = useLogin();
  const logoutState = useLogout();
  const userState = useUserState();

  return {
    // Login state and actions
    loading: loginState.isPending,
    login: async (credentials) => {
      return new Promise<void>((resolve, reject) => {
        loginState.mutate(credentials, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    
    // Logout actions
    logout: logoutState.logout,
    
    // User state
    isAuthenticated: userState.isAuthenticated,
    user: userState.user,
  };
}

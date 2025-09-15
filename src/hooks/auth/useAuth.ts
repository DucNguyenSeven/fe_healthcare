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
    isLoading: loginState.isLoading,
    error: loginState.error,
    login: loginState.login,
    clearError: loginState.clearError,
    
    // Logout actions
    logout: logoutState.logout,
    
    // User state
    isAuthenticated: userState.isAuthenticated,
    user: userState.user,
  };
}

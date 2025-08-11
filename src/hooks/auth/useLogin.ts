"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/user/auth';
import { parseApiError } from '@/lib/api/errors';
import { tokenStore } from '@/utils/auth/token';
import { useUserState } from './useUserState';
import { UseLoginReturn, LoginCredentials, AuthState } from './types';

export function useLogin(): UseLoginReturn {
  const router = useRouter();
  const { setUser } = useUserState();
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await AuthApi.login({
        email: credentials.email,
        password: credentials.password,
      });

      if (response.success && response.data) {
        // Store tokens in memory as fallback (server should set httpOnly cookies)
        tokenStore.set({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        
        // Store user info in localStorage for easy access
        const userData = {
          userId: response.data.userId,
          email: response.data.email,
          role: response.data.role,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update context
        setUser(userData);

        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));

        // Check if there's a redirect path from before login
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          // Redirect to main page or dashboard
          router.push('/');
        }
        return true;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 401:
          errorMessage = 'Email hoặc mật khẩu không chính xác';
          break;
        case 400:
          errorMessage = 'Thông tin đăng nhập không hợp lệ';
          break;
        case 404:
          errorMessage = 'Tài khoản không tồn tại';
          break;
        case 500:
          errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau';
          break;
        default:
          if (!errorMessage) {
            errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại';
          }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, [router, setUser]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    clearError,
  };
}

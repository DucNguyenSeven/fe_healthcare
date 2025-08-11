"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/user/auth';
import { parseApiError } from '@/lib/api/errors';
import type { ResetPasswordFormData } from '@/types';

interface UseResetPasswordState {
  isLoading: boolean;
  error: string | null;
  email: string;
  resetToken: string;
}

interface UseResetPasswordReturn extends UseResetPasswordState {
  resetPassword: (data: ResetPasswordFormData) => Promise<boolean>;
  clearError: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
  const router = useRouter();
  const [state, setState] = useState<UseResetPasswordState>({
    isLoading: false,
    error: null,
    email: '',
    resetToken: '',
  });

  // Get email and reset token from sessionStorage on component mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otp-email');
    const storedToken = sessionStorage.getItem('reset-token');
    
    if (!storedEmail || !storedToken) {
      // If no data found, redirect back to forgot password
      router.push('/forgot-password');
      return;
    }

    setState(prev => ({
      ...prev,
      email: storedEmail,
      resetToken: storedToken,
    }));
  }, [router]);

  const validateForm = (data: ResetPasswordFormData): string | null => {
    // Password strength validation
    if (data.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Password match validation
    if (data.password !== data.confirmPassword) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return null;
  };

  const resetPassword = useCallback(async (data: ResetPasswordFormData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Validate form data
      const validationError = validateForm(data);
      if (validationError) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: validationError 
        }));
        return false;
      }

      const response = await AuthApi.resetPassword({
        email: state.email,
        resetToken: state.resetToken,
        password: data.password,
      });

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));

        // Clear reset data from sessionStorage
        sessionStorage.removeItem('otp-email');
        sessionStorage.removeItem('otp-flow');
        sessionStorage.removeItem('reset-token');
        
        // Redirect to login with success message
        router.push('/login?message=password-reset-success');
        return true;
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 400:
          errorMessage = 'Yêu cầu không hợp lệ';
          break;
        case 401:
          errorMessage = 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn';
          break;
        case 404:
          errorMessage = 'Không tìm thấy yêu cầu đặt lại mật khẩu';
          break;
        case 422:
          errorMessage = 'Dữ liệu không đúng định dạng';
          break;
        case 500:
          errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau';
          break;
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return false;
    }
  }, [state.email, state.resetToken, router]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    resetPassword,
    clearError,
  };
}

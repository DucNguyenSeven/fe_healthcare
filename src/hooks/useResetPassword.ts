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
  otp: string;
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
    otp: '',
  });

  // Get email and otp from URL or sessionStorage on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramEmail = params.get('email');
    const paramOtp = params.get('otp');

    const storedEmail = sessionStorage.getItem('otp-email');
    const storedOtp = sessionStorage.getItem('otp-code');

    // Also check localStorage as backup
    const backupEmail = localStorage.getItem('reset-password-email');
    const backupOtp = localStorage.getItem('reset-password-otp');

    const finalEmail = (paramEmail || storedEmail || backupEmail || '').trim();
    const finalOtp = (paramOtp || storedOtp || backupOtp || '').trim();

    // Check if we have valid data
    if (!finalEmail || !finalOtp || finalEmail === '' || finalOtp === '') {
      setState(prev => ({ ...prev, error: 'Thiếu thông tin đặt lại mật khẩu. Vui lòng yêu cầu OTP lại.' }));
      return;
    }

    // Persist again to ensure availability on refresh
    sessionStorage.setItem('otp-email', finalEmail);
    sessionStorage.setItem('otp-code', finalOtp);

    // Also save to localStorage as backup
    localStorage.setItem('reset-password-email', finalEmail);
    localStorage.setItem('reset-password-otp', finalOtp);

    setState(prev => ({
      ...prev,
      email: finalEmail,
      otp: finalOtp,
    }));
  }, []);

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
        otp: state.otp,
        newPassword: data.password,
      });

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));

        // Clear reset data from sessionStorage and localStorage
        sessionStorage.removeItem('otp-email');
        sessionStorage.removeItem('otp-flow');
        sessionStorage.removeItem('otp-code');

        // Also clear from localStorage
        localStorage.removeItem('reset-password-email');
        localStorage.removeItem('reset-password-otp');
        
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
          errorMessage = 'OTP không hợp lệ hoặc đã hết hạn';
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
  }, [state.email, state.otp, router]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    resetPassword,
    clearError,
  };
}

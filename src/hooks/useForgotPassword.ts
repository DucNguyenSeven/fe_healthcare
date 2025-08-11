"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/user/auth';
import { parseApiError } from '@/lib/api/errors';
import type { ForgotFormData } from '@/types';

interface UseForgotPasswordState {
  isLoading: boolean;
  error: string | null;
}

interface UseForgotPasswordReturn extends UseForgotPasswordState {
  sendResetOTP: (data: ForgotFormData) => Promise<boolean>;
  clearError: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const router = useRouter();
  const [state, setState] = useState<UseForgotPasswordState>({
    isLoading: false,
    error: null,
  });

  const validateForm = (data: ForgotFormData): string | null => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return 'Email không hợp lệ';
    }

    return null;
  };

  const sendResetOTP = useCallback(async (data: ForgotFormData): Promise<boolean> => {
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

      const response = await AuthApi.sendOtpResetPassword(data.email);

      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));

        // Store email and flow type in sessionStorage for OTP verification
        sessionStorage.setItem('otp-email', data.email);
        sessionStorage.setItem('otp-flow', 'forgot-password');
        
        // Store reset token from response for later use
        if (response.data.resetToken) {
          sessionStorage.setItem('reset-token', response.data.resetToken);
        }
        
        router.push('/otp');
        return true;
      } else {
        throw new Error(response.message || 'Failed to send reset OTP');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 400:
          errorMessage = 'Email không hợp lệ';
          break;
        case 404:
          errorMessage = 'Email không tồn tại trong hệ thống';
          break;
        case 429:
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
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
  }, [router]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendResetOTP,
    clearError,
  };
}

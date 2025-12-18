"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/user';
import { parseApiError } from '@/lib/api/errors';
import { ROUTES } from '@/constants/routes';

interface UseOTPForgotPasswordState {
  isLoading: boolean;
  error: string | null;
  resendCooldown: number;
}

interface UseOTPForgotPasswordReturn extends UseOTPForgotPasswordState {
  validateOTP: (email: string, otp: string) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  clearError: () => void;
  setResendCooldown: (seconds: number) => void;
}

export function useOTPForgotPassword(): UseOTPForgotPasswordReturn {
  const router = useRouter();
  const [state, setState] = useState<UseOTPForgotPasswordState>({
    isLoading: false,
    error: null,
    resendCooldown: 0,
  });

  // Handle countdown timer
  useEffect(() => {
    if (state.resendCooldown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, resendCooldown: prev.resendCooldown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.resendCooldown]);

  const validateForm = (email: string, otp: string): string | null => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ';
    }

    // OTP validation
    if (!otp || otp.length !== 6) {
      return 'Mã OTP phải có 6 số';
    }

    if (!/^\d{6}$/.test(otp)) {
      return 'Mã OTP chỉ được chứa số';
    }

    return null;
  };

  const validateOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Validate form data
      const validationError = validateForm(email, otp);
      if (validationError) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: validationError 
        }));
        return false;
      }

      const response = await AuthAPI.validateOtp(email, otp);

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));

        // Store validated OTP info for reset password page
        sessionStorage.setItem('reset-password-email', email);
        sessionStorage.setItem('reset-password-otp', otp);
        sessionStorage.setItem('reset-password-timestamp', Date.now().toString());
        
        // Clear forgot password session
        sessionStorage.removeItem('forgot-password-email');
        sessionStorage.removeItem('forgot-password-timestamp');
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to validate OTP');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 400:
          errorMessage = 'Mã OTP không hợp lệ';
          break;
        case 401:
          errorMessage = 'Mã OTP không chính xác';
          break;
        case 403:
          errorMessage = 'Mã OTP đã hết hạn';
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
  }, []);

  const resendOTP = useCallback(async (email: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Email không hợp lệ' 
        }));
        return false;
      }

      const response = await AuthAPI.sendOtpResetPassword(email);

      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          resendCooldown: 60 // Start 60 second cooldown
        }));

        // Update timestamp in sessionStorage
        sessionStorage.setItem('forgot-password-timestamp', Date.now().toString());
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 400:
          errorMessage = 'Email không hợp lệ';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này';
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
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setResendCooldown = useCallback((seconds: number) => {
    setState(prev => ({ ...prev, resendCooldown: seconds }));
  }, []);

  return {
    ...state,
    validateOTP,
    resendOTP,
    clearError,
    setResendCooldown,
  };
}

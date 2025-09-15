"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/user/auth';
import { parseApiError } from '@/lib/api/errors';
import type { RegisterFormData } from '@/types';

interface UseRegisterState {
  isLoading: boolean;
  error: string | null;
}

interface UseRegisterReturn extends UseRegisterState {
  register: (data: RegisterFormData) => Promise<boolean>;
  clearError: () => void;
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const [state, setState] = useState<UseRegisterState>({
    isLoading: false,
    error: null,
  });

  const validateForm = (data: RegisterFormData): string | null => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailOrPhone)) {
      return 'Email không hợp lệ';
    }

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

  const register = useCallback(async (data: RegisterFormData): Promise<boolean> => {
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

      const response = await AuthApi.register({
        email: data.emailOrPhone,  // Backend expects 'email'
        password: data.password,
      });

      if (response.success && response.data) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));

        // Registration successful - redirect to OTP verification
        // Store email in sessionStorage for OTP verification
        sessionStorage.setItem('otp-email', data.emailOrPhone);
        router.push('/otp');
        return true;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = parsedError.message;
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 400:
          errorMessage = 'Thông tin đăng ký không hợp lệ';
          break;
        case 409:
          errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác';
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
  }, [router]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    register,
    clearError,
  };
}

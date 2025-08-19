import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApi } from '@/lib/api/user/auth';
import { parseApiError } from '@/lib/api/errors';

export const useOTP = () => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [otpFlow, setOtpFlow] = useState<'registration' | 'forgot-password'>('registration');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Get email and flow type from sessionStorage on component mount
  useEffect(() => {
    // Prefer URL params if provided; fall back to sessionStorage; don't redirect if missing.
    const params = new URLSearchParams(window.location.search);
    const paramEmail = params.get('email');
    const paramFlow = params.get('flow') as 'registration' | 'forgot-password' | null;

    const storedEmail = sessionStorage.getItem('otp-email');
    const storedFlow = sessionStorage.getItem('otp-flow') as 'registration' | 'forgot-password' | null;

    if (paramEmail) {
      setEmail(paramEmail);
      sessionStorage.setItem('otp-email', paramEmail);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setEmail('');
    }

    if (paramFlow === 'forgot-password' || paramFlow === 'registration') {
      setOtpFlow(paramFlow);
      sessionStorage.setItem('otp-flow', paramFlow);
    } else if (storedFlow) {
      setOtpFlow(storedFlow);
    } else {
      setOtpFlow('registration');
    }
  }, []);

  const handleOtpChange = useCallback((index: number, value: string) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input if current input has value
    if (value && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleKeyDown = useCallback((index: number, event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  }, [otpValues]);

  const handleInputFocus = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleResendOTP = useCallback(async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      if (otpFlow === 'registration') {
        response = await AuthApi.sendOtpRegister(email);
      } else {
        response = await AuthApi.sendOtpResetPassword(email);
      }
      
      if (response.success) {
        // Optionally show success message
        console.log('OTP đã được gửi lại');
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      setError('Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [email, otpFlow]);

  const handleBackToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleSubmit = useCallback(async (event: React.SyntheticEvent) => {
    event.preventDefault();
    
    if (!email) return;
    
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthApi.validateOtp(email, otpCode);
      if (response.success) {
        // Clear OTP data from sessionStorage
        sessionStorage.removeItem('otp-email');
        sessionStorage.removeItem('otp-flow');
        
        if (otpFlow === 'registration') {
          // Registration flow: redirect to login with success message
          router.push('/login?message=registration-success');
        } else {
          // Forgot password flow: redirect to reset password page
          router.push('/reset-password');
        }
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      let errorMessage = 'Xác thực OTP thất bại';
      
      // Override with more specific Vietnamese messages
      switch (parsedError.status) {
        case 400:
          errorMessage = 'Mã OTP không hợp lệ';
          break;
        case 408:
          errorMessage = 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới';
          break;
        case 404:
          errorMessage = 'Không tìm thấy yêu cầu xác thực';
          break;
        case 500:
          errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau';
          break;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, otpValues, otpFlow, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    otpValues,
    activeIndex,
    email,
    otpFlow,
    isLoading,
    error,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handleInputFocus,
    handleResendOTP,
    handleBackToLogin,
    handleSubmit,
    clearError,
  };
};

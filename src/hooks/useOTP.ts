import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useOTP = () => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

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

  const handleResendOTP = useCallback(() => {
    // TODO: Implement resend OTP logic
    console.log('Resend OTP clicked');
  }, []);

  const handleBackToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleSubmit = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    // TODO: Implement OTP verification logic
    console.log('OTP verification attempt:', otpValues);
  }, [otpValues]);

  return {
    otpValues,
    activeIndex,
    inputRefs,
    handleOtpChange,
    handleKeyDown,
    handleInputFocus,
    handleResendOTP,
    handleBackToLogin,
    handleSubmit,
  };
};

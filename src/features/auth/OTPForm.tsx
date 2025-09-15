"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HealthcareLogo } from '../../shared/ui/HealthcareLogo';
import { useVerifyAccount } from '../../hooks/auth/useVerifyAccount';
import { AuthAPI } from '../../lib/api/user';
import { toast } from 'sonner';
interface OTPFormProps {
  onNavigate: (page: 'login' | 'register' | 'forgot-password' | 'otp', email?: string) => void;
  userEmail: string;
}
export const OTPForm = ({
  onNavigate,
  userEmail
}: OTPFormProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Use verify account hook
  const { mutate: verifyAccount, isPending: isLoading } = useVerifyAccount();
  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  const handleInputChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        setFocusedIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
    setError('');

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    setFocusedIndex(focusIndex);
    inputRefs.current[focusIndex]?.focus();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    // Clear any previous errors
    setError('');
    
    // Call verify account API
    verifyAccount(
      {
        email: userEmail,
        otp: otpValue
      },
      {
        onSuccess: () => {
          // Show success notification
          toast.success('Xác thực thành công!', {
            description: 'Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ',
            duration: 4000,
          });
          
          // Navigate to login page on successful verification
          setTimeout(() => {
            onNavigate('login');
          }, 1000); // Delay để user đọc được toast
        },
        onError: (error: any) => {
          // Handle API errors
          const errorMessage = error?.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn';
          
          // Show error toast
          toast.error('Xác thực thất bại', {
            description: errorMessage,
            duration: 4000,
          });
          
          setError(errorMessage);
        }
      }
    );
  };
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      // Call resend OTP API
      await AuthAPI.sendOtpRegister(userEmail);
      
      // Reset form state
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      // Handle resend error
      const errorMessage = error?.response?.data?.message || 'Không thể gửi lại mã OTP, vui lòng thử lại';
      setError(errorMessage);
    }
  };
  const isComplete = otp.every(digit => digit !== '');
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.6,
    ease: "easeOut"
  }} className="w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-6 px-7" style={{
    maxHeight: '720px'
  }}>
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <HealthcareLogo size="md" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Xác thực tài khoản
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-2">
          <span>
            Chúng tôi đã gửi mã OTP xác thực tới email của bạn, vui lòng nhập mã để hoàn tất quá trình.
          </span>
        </p>
        <p className="text-blue-600 font-medium text-sm">
          {userEmail}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* OTP Input Fields */}
        <div>
          <div className="flex justify-center gap-3 mb-2">
            {otp.map((digit, index) => <motion.input key={index} ref={el => {
            inputRefs.current[index] = el;
          }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleInputChange(index, e.target.value)} onKeyDown={e => handleKeyDown(index, e)} onFocus={() => setFocusedIndex(index)} onPaste={index === 0 ? handlePaste : undefined} className={`
                  w-[50px] h-[50px] text-center text-xl font-bold border-2 rounded-xl 
                  focus:outline-none transition-all duration-200 
                  ${error ? 'border-red-300 bg-red-50 text-red-600' : focusedIndex === index || digit ? 'border-blue-500 bg-blue-50 text-gray-900 shadow-md' : 'border-gray-200 bg-gray-50/50 text-gray-900 hover:border-gray-300 hover:bg-white'}
                `} whileFocus={{
            scale: 1.05
          }} whileHover={{
            scale: digit ? 1 : 1.02
          }} />)}
          </div>
          
          {error && <motion.p initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center text-sm text-red-600 mt-2">
              {error}
            </motion.p>}
        </div>

        {/* Submit Button */}
        <motion.button whileHover={{
        scale: isLoading ? 1 : 1.02
      }} whileTap={{
        scale: isLoading ? 1 : 0.98
      }} type="submit" disabled={isLoading || !isComplete} className={`
            w-full h-12 rounded-xl font-semibold transition-all duration-200 shadow-lg
            ${isComplete && !isLoading ? 'bg-[#2563EB] text-white hover:bg-blue-700 shadow-blue-200/50' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
          `}>
          {isLoading ? <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang xác thực...</span>
            </div> : 'Xác nhận'}
        </motion.button>
      </form>

      {/* Action Links */}
      <div className="mt-8 space-y-4">
        <div className="text-center">
          <motion.button whileHover={{
          scale: resendCooldown > 0 ? 1 : 1.02
        }} whileTap={{
          scale: resendCooldown > 0 ? 1 : 0.98
        }} onClick={handleResend} disabled={resendCooldown > 0} className={`
              text-sm font-medium transition-all duration-200
              ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#2563EB] hover:text-blue-700 hover:underline'}
            `}>
            {resendCooldown > 0 ? `Gửi lại mã OTP (${resendCooldown}s)` : 'Gửi lại mã OTP'}
          </motion.button>
        </div>
        
        <div className="text-center">
          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} onClick={() => onNavigate('login')} className="text-sm font-medium text-gray-600 hover:text-gray-700 hover:underline transition-all duration-200">
            Quay lại đăng nhập
          </motion.button>
        </div>
      </div>
    </motion.div>;
};
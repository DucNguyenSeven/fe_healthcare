"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle } from 'lucide-react';
import { HealthcareLogo } from '../../shared/ui/HealthcareLogo';
import { AuthAPI } from '../../lib/api/user';
import { toast } from 'sonner';
import { getVietnameseErrorMessage, ERROR_MESSAGES } from '@/utils/errorMessages';

interface ResetPasswordFormProps {
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void;
  userEmail: string;
  userOtp: string;
}

export const ResetPasswordForm = ({
  onNavigate,
  userEmail,
  userOtp
}: ResetPasswordFormProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    }
    return '';
  };

  const handleInputChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'newPassword') {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({ newPassword: '', confirmPassword: '', general: '' });
    
    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors(prev => ({ ...prev, newPassword: passwordError }));
      return;
    }
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
      return;
    }

    setIsLoading(true);
    
    try {
      // Call reset password API
      await AuthAPI.resetPassword({
        email: userEmail,
        otp: userOtp,
        newPassword: newPassword
      });
      
      // Show success state
      setIsSuccess(true);
      
      // Show success toast
      toast.success('Đặt lại mật khẩu thành công!', {
        description: 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ',
        duration: 4000,
      });
      
      setIsLoading(false);
      
      // Navigate to login after 3 seconds
      setTimeout(() => {
        onNavigate('login');
      }, 3000);
      
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle API errors
      const apiMessage = error?.response?.data?.message || '';
      const vietnameseMessage = getVietnameseErrorMessage(apiMessage, ERROR_MESSAGES.FORGOT_PASSWORD.DEFAULT);
      
      // Show error toast
      toast.error('Đặt lại mật khẩu thất bại', {
        description: vietnameseMessage,
        duration: 4000,
      });
      
      setErrors(prev => ({ ...prev, general: vietnameseMessage }));
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-6 px-7"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <HealthcareLogo size="md" />
        </div>

        {/* Success State */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Thành công!
          </h1>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('login')}
            className="w-full h-12 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg"
          >
            Đăng nhập ngay
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }} 
      className="w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-6 px-7"
    >
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <HealthcareLogo size="md" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Đặt lại mật khẩu
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-2">
          Tạo mật khẩu mới cho tài khoản của bạn
        </p>
        <p className="text-blue-600 font-medium text-sm">
          {userEmail}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password Field */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => handleInputChange('newPassword', e.target.value)}
              className={`w-full h-12 pl-12 pr-4 border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white ${
                errors.newPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
              }`}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          {errors.newPassword && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-1 text-xs text-red-600"
            >
              {errors.newPassword}
            </motion.p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full h-12 pl-12 pr-4 border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white ${
                errors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
              }`}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          {errors.confirmPassword && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-1 text-xs text-red-600"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </div>


        {/* General Error */}
        {errors.general && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
          >
            {errors.general}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword}
          className={`w-full h-12 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
            !isLoading && newPassword && confirmPassword
              ? 'bg-[#2563EB] text-white hover:bg-blue-700 shadow-blue-200/50'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang cập nhật...</span>
            </div>
          ) : (
            'Đặt lại mật khẩu'
          )}
        </motion.button>
      </form>

      {/* Action Links */}
      <div className="mt-6 text-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('login')}
          className="text-sm font-medium text-gray-600 hover:text-gray-700 hover:underline transition-all duration-200"
        >
          Quay lại đăng nhập
        </motion.button>
      </div>
    </motion.div>
  );
};

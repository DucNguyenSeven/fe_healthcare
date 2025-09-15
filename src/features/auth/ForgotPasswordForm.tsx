"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { HealthcareLogo } from '../../shared/ui/HealthcareLogo';
interface ForgotPasswordFormProps {
  onNavigate: (page: 'login' | 'register' | 'forgot-password' | 'otp', email?: string) => void;
}
export const ForgotPasswordForm = ({
  onNavigate
}: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Chuyển đến OTP form ngay sau khi gửi email thành công
      onNavigate('otp', email);
    }, 2000);
  };
  const handleResend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.6
  }} className="w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-6 px-7" style={{
    maxHeight: '760px'
  }}>
      {/* Logo Block */}
      <div className="flex justify-center mb-4">
        <HealthcareLogo size="md" />
      </div>

      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSubmitted ? 'Kiểm tra email' : 'Quên mật khẩu'}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          {isSubmitted ? <span>Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến {email}</span> : <span>Nhập email để nhận hướng dẫn đặt lại mật khẩu.</span>}
        </p>
      </div>

      {!isSubmitted ? <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input id="email" type="email" value={email} onChange={e => {
            setEmail(e.target.value);
            if (error) setError('');
          }} className={`w-full h-12 pl-12 pr-4 border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white ${error ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`} placeholder="Nhập email của bạn" />
            </div>
            {error && <motion.p initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mt-1 text-xs text-red-600">
                {error}
              </motion.p>}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} type="submit" disabled={isLoading} className="w-full h-12 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg">
              {isLoading ? <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang gửi...</span>
                </div> : 'Gửi yêu cầu'}
            </motion.button>
          </div>
        </form> : <div className="space-y-4">
          {/* Success State */}
          <div className="text-center">
            <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          duration: 0.5
        }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              <span>Không nhận được email? Kiểm tra thư mục spam hoặc</span>
            </p>
          </div>

          {/* Resend Button */}
          <motion.button whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={handleResend} disabled={isLoading} className="w-full h-12 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            {isLoading ? <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang gửi lại...</span>
              </div> : 'Gửi lại email'}
          </motion.button>
        </div>}

      {/* Action Links */}
      <div className="mt-6 space-y-2">
        <div className="text-center">
          <button onClick={() => onNavigate('login')} className="text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors">
            Quay lại đăng nhập
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            <span>Chưa có tài khoản? </span>
            <button onClick={() => onNavigate('register')} className="font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </motion.div>;
};
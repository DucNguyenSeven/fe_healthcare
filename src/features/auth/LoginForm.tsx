"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { HealthcareLogo } from '../../shared/ui/HealthcareLogo';
interface LoginFormProps {
  onNavigate: (page: 'login' | 'register' | 'forgot-password' | 'otp', email?: string) => void;
  onLoginSuccess?: (email: string) => void;
}
export const LoginForm = ({
  onNavigate,
  onLoginSuccess
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic based on email
      if (onLoginSuccess) {
        onLoginSuccess(email);
      }
    }, 1000);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
        <p className="text-gray-600 text-sm">
          <span>Chào mừng bạn quay trở lại Healthcare+</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white" placeholder="Nhập email của bạn" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white" placeholder="Nhập mật khẩu" />
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB] focus:ring-2" />
            <span className="ml-3 text-sm font-medium text-gray-700">Nhớ tôi</span>
          </label>
          <button type="button" onClick={() => onNavigate('forgot-password')} className="text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
            Quên mật khẩu?
          </button>
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
                <span>Đang đăng nhập...</span>
              </div> : 'Đăng nhập'}
          </motion.button>
        </div>
      </form>

      {/* Social Login Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Hoặc đăng nhập với</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className="w-full h-11 inline-flex justify-center items-center border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </motion.button>

          <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className="w-full h-11 inline-flex justify-center items-center border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </motion.button>
        </div>
      </div>

      {/* Footer Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          <span>Chưa có tài khoản? </span>
          <button onClick={() => onNavigate('register')} className="font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
            Đăng ký ngay
          </button>
        </p>
      </div>
    </motion.div>;
};
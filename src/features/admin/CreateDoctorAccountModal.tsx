'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, UserPlus, Info } from 'lucide-react';
import { useRegisterDoctor } from '@/hooks/admin/useRegisterDoctor';

interface CreateDoctorAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDoctorAccountModal({
  isOpen,
  onClose,
}: CreateDoctorAccountModalProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: registerDoctor, isPending } = useRegisterDoctor();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setErrors({});
    }
  }, [isOpen]);

  // Email validation
  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!trimmedEmail.includes('@')) {
      newErrors.email = 'Email phải chứa ký tự @';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)) {
      newErrors.email = 'Email không đúng định dạng. Ví dụ: example@gmail.com';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    // Call mutation hook
    registerDoctor(email.trim(), {
      onSuccess: () => {
        // Close modal after 1.5 seconds
        setTimeout(() => {
          onClose();
        }, 1500);
      },
    });
  };

  // Handle input change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear error when user types
    if (errors.email) {
      setErrors({});
    }
  };

  // Validate on blur (when user leaves the field)
  const handleEmailBlur = () => {
    if (email.trim()) {
      validateEmail();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPending) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isPending, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Tạo tài khoản Bác sĩ
                    </h2>
                    <p className="text-sm text-gray-600">
                      Cấp quyền truy cập cho bác sĩ mới
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isPending}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="p-6">
              {/* Email Field */}
              <div className="mb-4">
                <label
                  htmlFor="doctor-email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Bác sĩ
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="doctor-email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    disabled={isPending}
                    className={`w-full h-12 pl-12 pr-4 border rounded-xl focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50 hover:bg-white focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
                    }`}
                    placeholder="Nhập email của bác sĩ"
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Info Box */}
              <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Thông tin đăng nhập ban đầu
                    </p>
                    <p className="text-sm text-blue-700">
                      Mật khẩu tạm thời: <span className="font-semibold">HealthCare@123</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Bác sĩ nên đổi mật khẩu ngay lần đầu đăng nhập bằng cách nhấn "Quên mật khẩu"
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 h-11 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <motion.button
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-11 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tạo...</span>
                    </div>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

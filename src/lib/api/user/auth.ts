import api from '../client';
import type { ApiEnvelope, RegisterResponse, LoginResponse, GetMeResponse } from '@/types/auth';
import type { RegisterPayload } from '@/hooks/auth/types';

export const AuthAPI = {
  register(payload: RegisterPayload) {
    return api.post<ApiEnvelope<RegisterResponse>>('/api/v1/auth/register', payload).then(r => r.data);
  },
  verifyAccount(email: string, otp: string) {
    return api.post<ApiEnvelope<boolean>>(`/api/v1/auth/verify-account`, null, {
      params: { email, otp },
    }).then(r => r.data);
  },
  login(payload: { email: string; password: string }) {
    return api.post<ApiEnvelope<LoginResponse>>('/api/v1/auth/login', payload).then(r => r.data);
  },
  getMe() {
    return api.get<ApiEnvelope<GetMeResponse>>('/api/v1/auth/getMe').then(r => r.data);
  },
  // Legacy methods for backward compatibility
  sendOtpRegister(email: string) {
    return api.get<ApiEnvelope<boolean>>(`/api/v1/auth/send-otp-register/${encodeURIComponent(email)}`).then(r => r.data);
  },
  sendOtpResetPassword(email: string) {
    return api.get<ApiEnvelope<string>>(`/api/v1/auth/send-otp-reset-password/${encodeURIComponent(email)}`).then(r => r.data);
  },
  validateOtp(email: string, otp: string) {
    return api.get<ApiEnvelope<boolean>>(`/api/v1/auth/validate-otp`, {
      params: { email, otp },
    }).then(r => r.data);
  },
  forgotPassword(payload: { email: string }) {
    return api.post<ApiEnvelope<boolean>>('/api/v1/auth/forgot-password', payload).then(r => r.data);
  },
  resetPassword(payload: { email: string; otp: string; newPassword: string }) {
    return api.post<ApiEnvelope<boolean>>('/api/v1/auth/reset-password', payload).then(r => r.data);
  },
};

// Export với tên cũ để tương thích ngược
export const AuthApi = AuthAPI;

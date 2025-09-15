import api from '../client';
import { createApiClient } from '../createApiClient';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  MessageResponse, 
  User, 
  VerifyOTPRequest,
  ForgotPasswordRequest 
} from '../types';

// Public client cho các endpoint không cần JWT
const publicClient = createApiClient();

export const AuthAPI = {
  // Đăng ký tài khoản
  register: (payload: RegisterRequest) => 
    api.post<MessageResponse<AuthResponse>>('/api/v1/auth/register', payload)
      .then(res => res.data),

  // Xác thực OTP sau đăng ký
  verifyAccount: (payload: VerifyOTPRequest) => 
    api.post<MessageResponse<any>>(`/api/v1/auth/verify-account?email=${encodeURIComponent(payload.email)}&otp=${payload.otp}`)
      .then(res => res.data),

  // Đăng nhập
  login: (payload: LoginRequest) => 
    api.post<MessageResponse<AuthResponse>>('/api/v1/auth/login', payload)
      .then(res => res.data),

  // Lấy thông tin user hiện tại (yêu cầu JWT)
  getMe: () => 
    api.get<MessageResponse<User>>('/api/v1/auth/getMe')
      .then(res => res.data),

  // --- Public endpoints (không cần JWT) ---
  
  // Gửi OTP đăng ký
  sendOTPRegister: (email: string) => 
    publicClient.get<MessageResponse<any>>(`/api/v1/auth/send-otp-register/${encodeURIComponent(email)}`)
      .then(res => res.data),

  // Gửi OTP reset password
  sendOTPResetPassword: (email: string) => 
    publicClient.get<MessageResponse<any>>(`/api/v1/auth/send-otp-reset-password/${encodeURIComponent(email)}`)
      .then(res => res.data),

  // Validate OTP
  validateOTP: (email: string, otp: string) => 
    publicClient.get<MessageResponse<any>>(`/api/v1/auth/validate-otp?email=${encodeURIComponent(email)}&otp=${otp}`)
      .then(res => res.data),

  // Quên mật khẩu
  forgotPassword: (payload: ForgotPasswordRequest) => 
    publicClient.post<MessageResponse<any>>('/api/v1/auth/forgot-password', payload)
      .then(res => res.data),

  // Reset mật khẩu
  resetPassword: (payload: ForgotPasswordRequest) => 
    publicClient.post<MessageResponse<any>>('/api/v1/auth/reset-password', payload)
      .then(res => res.data),
};

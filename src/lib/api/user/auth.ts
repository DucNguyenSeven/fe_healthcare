import { api } from "@/lib/api/client";
import type {
  MessageResponse,
  AuthenticationResponse,
  LoginResponse,
  RegisterRequest,
  AuthenticationRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/lib/api/types";

export const AuthApi = {
  register: (payload: RegisterRequest) =>
    api.post<MessageResponse<AuthenticationResponse>>("/api/user/auth/register", payload).then(res => res.data),
  login: (payload: AuthenticationRequest) =>
    api.post<MessageResponse<LoginResponse>>("/api/user/auth/login", payload).then(res => res.data),
  refreshToken: () =>
    api.post<MessageResponse<AuthenticationResponse>>("/api/user/auth/refresh-token").then(res => res.data),
  sendOtpRegister: (email: string) =>
    api.get<MessageResponse<boolean>>(`/api/user/auth/send-otp-register/${encodeURIComponent(email)}`).then(res => res.data),
  validateOtp: (email: string, otp: string) =>
    api.get<MessageResponse<boolean>>(`/api/user/auth/validate-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`).then(res => res.data),
  sendOtpResetPassword: (email: string) =>
    api.get<MessageResponse<ResetPasswordResponse>>(`/api/user/auth/send-otp-reset-password/${encodeURIComponent(email)}`).then(res => res.data),
  resetPassword: (payload: ResetPasswordRequest) =>
    api.post<MessageResponse<boolean>>("/api/user/auth/reset-password", payload).then(res => res.data),
};

import { apiFetch } from "@/lib/api/client";
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
    apiFetch<MessageResponse<AuthenticationResponse>>("/api/user/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: AuthenticationRequest) =>
    apiFetch<MessageResponse<LoginResponse>>("/api/user/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  refreshToken: () =>
    apiFetch<MessageResponse<AuthenticationResponse>>("/api/user/auth/refresh-token", {
      method: "POST",
    }),
  sendOtpRegister: (email: string) =>
    apiFetch<MessageResponse<boolean>>(`/api/user/auth/send-otp-register/${encodeURIComponent(email)}`),
  validateOtp: (email: string, otp: string) =>
    apiFetch<MessageResponse<boolean>>(`/api/user/auth/validate-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`),
  sendOtpResetPassword: (email: string) =>
    apiFetch<MessageResponse<ResetPasswordResponse>>(`/api/user/auth/send-otp-reset-password/${encodeURIComponent(email)}`),
  resetPassword: (payload: ResetPasswordRequest) =>
    apiFetch<MessageResponse<boolean>>("/api/user/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

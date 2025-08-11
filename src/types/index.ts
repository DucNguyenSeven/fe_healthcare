// Auth Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

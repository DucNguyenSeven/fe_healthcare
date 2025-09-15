// Base response type cho tất cả API responses
export interface MessageResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'patient' | 'doctor';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

// Upload related types
export interface UploadFile {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// OTP related types
export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// Chat related types
export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

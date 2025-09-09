export type MessageResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
};

export type AuthenticationResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  userId: string;
  role: string;
};

export type ResetPasswordResponse = {
  statusCode: number;
  message: string;
  email: string;
};

export type UploadFile = {
  imageUrls: string[];
  publicIds: string[];
};

export type UserResponse = Record<string, unknown>;

export type RegisterRequest = { email: string; password: string };
export type AuthenticationRequest = { email: string; password: string };
export type ResetPasswordRequest = { email: string; newPassword: string };
export type UpdateUserRequest = {
  userId: string;
  fullName?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  address?: string;
  role?: string;
};

export type ChatRequest = { question: string };
export type ChatResponse = { answer: string };

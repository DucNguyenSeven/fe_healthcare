// Register trả về snake_case trong data
export type RegisterResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string; // "Bearer"
  expires_in?: number; // seconds
};

// Login trả về camelCase trong data
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  email: string;
  userId: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
};

export type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
};

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

// GetMe response - thông tin user đầy đủ
export type GetMeResponse = {
  createdAt: string;
  updatedAt: string;
  userId: string;
  password: string; // hashed password
  email: string;
  fullName: string | null;
  gender: string | null;
  dob: string | null; // date of birth
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  status: 'ACTIVE' | 'INACTIVE';
  medicalHistories: any[];
  height: number;
  weight: number;
  bloodType: string | null;
  bmi: number;
  insurance: string | null;
};

export type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
};

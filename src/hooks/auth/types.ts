export type RegisterPayload = { email: string; password: string };
export type VerifyPayload = { email: string; otp: string };
export type LoginPayload = { email: string; password: string };

export interface UseLogoutReturn {
  logout: () => void;
}

export interface UseAuthReturn {
  user: any | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface UseUserStateReturn {
  user: any | null;
  setUser: (user: any | null) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

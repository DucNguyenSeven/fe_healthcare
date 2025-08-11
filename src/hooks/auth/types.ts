// Auth hooks types
export interface User {
  userId: string;
  email: string;
  role: string;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UseLoginReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  clearError: () => void;
}

export interface UseLogoutReturn {
  logout: () => void;
}

export interface UseUserStateReturn {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
  user: User | null;
}

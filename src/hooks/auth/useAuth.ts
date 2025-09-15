import { useState } from 'react';
import { AuthAPI, parseApiError, setAccessToken, setRefreshToken, clearTokens } from '@/lib/api';
import { setUserRole, clearUserRole } from '@/lib/utils/auth';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/lib/api';

interface UseAuthReturn {
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  register: (payload: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginRequest): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthAPI.login(payload);
      if (response.data) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        
        // Lưu role của user vào localStorage
        if (response.data.user?.role) {
          setUserRole(response.data.user.role as any);
        } else {
          // Fallback logic dựa trên email (cho demo)
          const email = payload.email.toLowerCase().trim();
          if (email === 'patient') {
            setUserRole('patient');
          } else if (email === 'doctor') {
            setUserRole('doctor');
          } else {
            setUserRole('patient'); // default
          }
        }
        
        return response.data;
      }
      throw new Error(response.message || 'Đăng nhập thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthAPI.register(payload);
      if (response.data) {
        // Không lưu token ngay, chờ verify OTP
        return response.data;
      }
      throw new Error(response.message || 'Đăng ký thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    clearUserRole();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  };

  return { login, register, logout, loading, error };
};

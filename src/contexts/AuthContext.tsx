'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAccessToken, clearTokens, isTokenValid } from '@/utils/auth/token';
import { AuthAPI } from '@/lib/api/user';
import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!getAccessToken();

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  // Get user data on mount if token exists and is valid
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();

      // Validate token before making API call
      if (token && isTokenValid(token)) {
        try {
          const response = await AuthAPI.getMe();
          setUser(response.data);
        } catch (error) {
          // Failed to get user info - clear tokens
          clearTokens();
        }
      } else if (token) {
        // Token exists but is expired - clear immediately without API call
        clearTokens();
      }
      // No token - do nothing

      setLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  userId: string;
  email: string;
  role: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  height?: number;
  weight?: number;
  bloodType?: string | null;
  bmi?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    checkAuthStatus,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

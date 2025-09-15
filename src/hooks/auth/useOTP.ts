import { useState } from 'react';
import { AuthAPI, parseApiError } from '@/lib/api';
import type { VerifyOTPRequest, ForgotPasswordRequest } from '@/lib/api';

interface UseOTPReturn {
  sendOTPRegister: (email: string) => Promise<void>;
  sendOTPResetPassword: (email: string) => Promise<void>;
  validateOTP: (email: string, otp: string) => Promise<void>;
  verifyAccount: (payload: VerifyOTPRequest) => Promise<void>;
  resetPassword: (payload: ForgotPasswordRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useOTP = (): UseOTPReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTPRegister = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await AuthAPI.sendOTPRegister(email);
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const sendOTPResetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await AuthAPI.sendOTPResetPassword(email);
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = async (email: string, otp: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await AuthAPI.validateOTP(email, otp);
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const verifyAccount = async (payload: VerifyOTPRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await AuthAPI.verifyAccount(payload);
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (payload: ForgotPasswordRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await AuthAPI.resetPassword(payload);
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { 
    sendOTPRegister, 
    sendOTPResetPassword, 
    validateOTP, 
    verifyAccount, 
    resetPassword, 
    loading, 
    error 
  };
};

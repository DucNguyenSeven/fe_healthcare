'use client';
import { useMutation } from '@tanstack/react-query';
import { AuthAPI } from '@/lib/api/user';
import type { VerifyPayload } from './types';

export function useVerifyAccount() {
  return useMutation({
    mutationFn: ({ email, otp }: VerifyPayload) => AuthAPI.verifyAccount(email, otp),
  });
}

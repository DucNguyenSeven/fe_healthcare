'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthAPI } from '@/lib/api/user';
import type { LoginPayload } from './types';
import { setAccessToken, setRefreshToken, getRoleFromToken } from '@/utils/auth/token';
import { useAuthContext } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => AuthAPI.login(payload),
    onSuccess: async (res) => {
      const d = res?.data;
      const at = d?.accessToken ?? (d as any)?.access_token;
      const rt = d?.refreshToken ?? (d as any)?.refresh_token;

      if (at) setAccessToken(at);
      if (rt) setRefreshToken(rt);

      // Set basic user data in context first
      if (d) {
        // Get role from response (primary method)
        let userRole = d.role;

        // Fallback: get role from JWT token (secondary method)
        if (!userRole && at) {
          const tokenRole = getRoleFromToken(at);
          userRole = tokenRole as 'PATIENT' | 'DOCTOR' | 'ADMIN';
        }

        const basicUserData = {
          userId: d.userId,
          email: d.email,
          role: userRole || 'PATIENT', // default fallback
        };
        setUser(basicUserData);

        // Store basic user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(basicUserData));

        // Store success message for dashboard display
        sessionStorage.setItem('loginSuccessMessage', 'Đăng nhập thành công! Chào mừng bạn quay trở lại.');

        // Fetch full user details using getMe API
        try {
          const getMeResponse = await AuthAPI.getMe();
          const fullUserData = getMeResponse?.data;
          
          if (fullUserData) {
            // Update user data with full information
            const completeUserData = {
              userId: fullUserData.userId,
              email: fullUserData.email,
              role: fullUserData.role,
              name: fullUserData.fullName,
              phone: fullUserData.phone,
              avatar: fullUserData.avatarUrl,
              gender: fullUserData.gender,
              dateOfBirth: fullUserData.dob,
              address: fullUserData.address,
              height: fullUserData.height,
              weight: fullUserData.weight,
              bloodType: fullUserData.bloodType,
              bmi: fullUserData.bmi,
              status: fullUserData.status,
              createdAt: fullUserData.createdAt,
              updatedAt: fullUserData.updatedAt,
            };
            
            // Update context with full user data
            setUser(completeUserData);
            
            // Store complete user data in localStorage
            localStorage.setItem('user', JSON.stringify(completeUserData));
            
            // Invalidate and refetch user queries
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
          }
        } catch (error) {
          // Unable to get detailed user info
          // Continue with basic user data if getMe fails
        }

        // Show success notification
        toast.success('Đăng nhập thành công!', {
          description: 'Chào mừng bạn quay trở lại Healthcare+',
          duration: 3000,
        });

        // Role-based redirect
        const redirectPath =
          userRole === 'DOCTOR' ? ROUTES.DOCTOR.DASHBOARD :
          userRole === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD :
          ROUTES.PATIENT.DASHBOARD;

        router.push(redirectPath);
      }
    },
  });
}

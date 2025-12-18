'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { ROUTES } from '@/constants/routes';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

/**
 * Custom hook for handling authenticated booking actions
 * Checks if user is logged in and redirects appropriately based on role
 */
export function useAuthenticatedBooking() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const handleBookingClick = (doctor?: Doctor) => {
    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      toast.info('Vui lòng đăng nhập để đặt lịch khám', {
        description: 'Bạn cần đăng nhập để sử dụng tính năng đặt lịch khám',
      });
      router.push(ROUTES.AUTH.LOGIN);
      return;
    }

    // Authenticated - redirect based on role
    const userRole = user.role;

    switch (userRole) {
      case 'PATIENT':
        // Redirect to patient appointments page
        router.push(ROUTES.PATIENT.APPOINTMENTS);
        break;

      case 'DOCTOR':
        // Doctors should not book appointments
        toast.info('Bác sĩ không thể đặt lịch khám', {
          description: 'Tài khoản bác sĩ không thể thực hiện đặt lịch khám',
        });
        router.push(ROUTES.DOCTOR.DASHBOARD);
        break;

      case 'ADMIN':
        // Admins should not book appointments
        toast.info('Quản trị viên không thể đặt lịch khám', {
          description: 'Tài khoản quản trị viên không thể thực hiện đặt lịch khám',
        });
        router.push(ROUTES.ADMIN.DASHBOARD);
        break;

      default:
        // Fallback for unknown roles
        toast.error('Vai trò người dùng không hợp lệ');
        router.push(ROUTES.HOME);
    }
  };

  return { handleBookingClick };
}

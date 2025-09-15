import { getAccessToken } from '@/utils/auth/token';
import { ROUTES } from '@/constants/routes';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

/**
 * Get user role from token or stored user data
 */
export function getUserRole(): UserRole | null {
  try {
    const token = getAccessToken();
    if (!token) return null;
    
    // Try to get role from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role as UserRole;
    }
    
    return null;
  } catch (error) {
    console.error('Không thể lấy role người dùng:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole): boolean {
  const userRole = getUserRole();
  return userRole === role;
}

/**
 * Get default redirect path based on user role
 */
export function getDefaultRedirectPath(role?: UserRole): string {
  const userRole = role || getUserRole();
  
  switch (userRole) {
    case 'DOCTOR':
      return ROUTES.DOCTOR.DASHBOARD;
    case 'PATIENT':
      return ROUTES.PATIENT.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
}

/**
 * Check if current user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

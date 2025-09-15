import type { UserRole } from '@/constants/routes'

/**
 * Lấy role của user hiện tại từ localStorage
 */
export function getUserRole(): UserRole | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const role = localStorage.getItem('userRole')
  return (role as UserRole) || null
}

/**
 * Lưu role của user vào localStorage
 */
export function setUserRole(role: UserRole): void {
  if (typeof window === 'undefined') {
    return
  }
  
  localStorage.setItem('userRole', role)
}

/**
 * Xóa role của user khỏi localStorage
 */
export function clearUserRole(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  localStorage.removeItem('userRole')
}

/**
 * Kiểm tra xem user có role được phép hay không
 */
export function hasRole(allowedRoles: string[]): boolean {
  const userRole = getUserRole()
  return userRole ? allowedRoles.includes(userRole) : false
}

/**
 * Lấy default redirect path dựa trên role
 */
export function getDefaultRedirectPath(role: UserRole): string {
  const redirectMap = {
    patient: '/patient',
    doctor: '/doctor'
  }
  
  return redirectMap[role] || '/patient'
}

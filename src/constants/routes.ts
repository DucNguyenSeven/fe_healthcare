// Route constants cho navigation và redirect
export const ROUTES = {
  // Public routes
  HOME: '/',
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    OTP: '/auth/otp'
  },
  
  // Protected routes
  PATIENT: {
    ROOT: '/patient',
    DASHBOARD: '/patient/dashboard',
    PROFILE: '/patient/profile',
    APPOINTMENTS: '/patient/appointments',
    TELEHEALTH: '/patient/telehealth',
    MONITORING: '/patient/monitoring',
    AI_ASSISTANT: '/patient/ai-assistant',
    COMMUNITY: '/patient/community'
  },
  
  DOCTOR: {
    ROOT: '/doctor',
    DASHBOARD: '/doctor/dashboard',
    PROFILE: '/doctor/profile',
    PATIENTS: '/doctor/patients',
    APPOINTMENTS: '/doctor/appointments',
    CONSULTATION: '/doctor/consultation',
    SCHEDULE: '/doctor/schedule',
    FORUM: '/doctor/forum'
  }
} as const

// Danh sách routes cần bảo vệ
export const PROTECTED_ROUTES = [
  ...Object.values(ROUTES.PATIENT),
  ...Object.values(ROUTES.DOCTOR)
]

// Default redirect sau khi đăng nhập theo role
export const DEFAULT_REDIRECT_BY_ROLE = {
  patient: ROUTES.PATIENT.ROOT,
  doctor: ROUTES.DOCTOR.ROOT
} as const

export type UserRole = keyof typeof DEFAULT_REDIRECT_BY_ROLE

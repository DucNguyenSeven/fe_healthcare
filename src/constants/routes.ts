export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Patient routes
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_PROFILE: '/patient/profile',
  PATIENT_APPOINTMENTS: '/patient/appointments',
  PATIENT_TELEHEALTH: '/patient/telehealth',
  PATIENT_MONITORING: '/patient/monitoring',
  PATIENT_AI_ASSISTANT: '/patient/ai-assistant',
  PATIENT_COMMUNITY: '/patient/community',
  
  // Doctor routes
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_PROFILE: '/doctor/profile',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_TELEHEALTH: '/doctor/telehealth',
  DOCTOR_SCHEDULE: '/doctor/schedule',
  DOCTOR_COMMUNITY: '/doctor/community',
  
  // Chat
  CHAT: '/chat',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

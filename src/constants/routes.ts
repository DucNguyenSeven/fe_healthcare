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
  
  // Chat
  CHAT: '/chat',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

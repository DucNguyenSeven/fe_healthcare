export type PatientNavId =
  | 'dashboard'
  | 'profile'
  | 'appointments'
  | 'telehealth'
  | 'monitoring'
  | 'ai-assistant'
  | 'community';

export interface NavigationItem {
  id: PatientNavId;
  label: string;
  path: string;
  icon?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Trang chủ',
    path: '/patient/dashboard',
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    path: '/patient/profile',
  },
  {
    id: 'appointments',
    label: 'Lịch hẹn',
    path: '/patient/appointments',
  },
  {
    id: 'telehealth',
    label: 'Khám từ xa',
    path: '/patient/telehealth',
  },
  {
    id: 'monitoring',
    label: 'Theo dõi',
    path: '/patient/monitoring',
  },
  {
    id: 'ai-assistant',
    label: 'Dự đoán với AI',
    path: '/patient/ai-assistant',
  },
  {
    id: 'community',
    label: 'Cộng đồng',
    path: '/patient/community',
  },
];

export type DoctorNavId =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'schedule'
  | 'consultations'
  | 'profile';

export interface NavigationItem {
  id: DoctorNavId;
  label: string;
  path: string;
  icon?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Bảng điều khiển',
    path: '/doctor/dashboard',
  },
  {
    id: 'patients',
    label: 'Bệnh nhân',
    path: '/doctor/patients',
  },
  {
    id: 'appointments',
    label: 'Lịch hẹn',
    path: '/doctor/appointments',
  },
  {
    id: 'schedule',
    label: 'Lịch làm việc',
    path: '/doctor/schedule',
  },
  {
    id: 'consultations',
    label: 'Tư vấn',
    path: '/doctor/consultations',
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    path: '/doctor/profile',
  },
];

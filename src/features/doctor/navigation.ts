import React from 'react';
import { ROUTES } from '@/constants/routes';
import { Home, Calendar, Video, Users, User as UserIcon, Clock } from 'lucide-react';

export type DoctorNavId = 'dashboard' | 'profile' | 'patients' | 'appointments' | 'telehealth' | 'schedule' | 'community';

export interface NavigationItem {
  id: DoctorNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home, path: ROUTES.DOCTOR_DASHBOARD },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserIcon, path: ROUTES.DOCTOR_PROFILE },
  { id: 'patients', label: 'Bệnh nhân', icon: Users, path: ROUTES.DOCTOR_PATIENTS },
  { id: 'appointments', label: 'Lịch hẹn', icon: Calendar, path: ROUTES.DOCTOR_APPOINTMENTS },
  { id: 'telehealth', label: 'Tư vấn online', icon: Video, path: ROUTES.DOCTOR_TELEHEALTH },
  { id: 'schedule', label: 'Lịch làm việc', icon: Clock, path: ROUTES.DOCTOR_SCHEDULE },
  { id: 'community', label: 'Diễn đàn', icon: Users, path: ROUTES.DOCTOR_COMMUNITY },
];



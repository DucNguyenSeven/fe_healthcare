import React from 'react';
import { ROUTES } from '@/constants/routes';
import { 
  Home,
  User,
  Calendar,
  Video,
  Activity,
  Bot,
  Users
} from 'lucide-react';

export type PatientNavId = 'dashboard' | 'profile' | 'appointments' | 'telehealth' | 'monitoring' | 'ai-assistant' | 'community';

export interface NavigationItem {
  id: PatientNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home, path: ROUTES.PATIENT_DASHBOARD },
  { id: 'profile', label: 'Hồ sơ', icon: User, path: ROUTES.PATIENT_PROFILE },
  { id: 'appointments', label: 'Lịch hẹn', icon: Calendar, path: ROUTES.PATIENT_APPOINTMENTS },
  { id: 'telehealth', label: 'Tư vấn online', icon: Video, path: ROUTES.PATIENT_TELEHEALTH },
  { id: 'monitoring', label: 'Theo dõi', icon: Activity, path: ROUTES.PATIENT_MONITORING },
  { id: 'ai-assistant', label: 'Trợ lý AI', icon: Bot, path: ROUTES.PATIENT_AI_ASSISTANT },
  { id: 'community', label: 'Cộng đồng', icon: Users, path: ROUTES.PATIENT_COMMUNITY },
];



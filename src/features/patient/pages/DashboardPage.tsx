"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { WelcomeSection } from '../components/WelcomeSection';
import { QuickActions } from '../components/QuickActions';
import { HealthMetrics } from '../components/HealthMetrics';
import { TodaySchedule } from '../components/TodaySchedule';
import { MedicationReminders } from '../components/MedicationReminders';
import { RecentConsultations } from '../components/RecentConsultations';
import { SuggestedArticles } from '../components/SuggestedArticles';
import { User, Appointment, HealthMetric, Alert } from '../types';

interface DashboardPageProps {
  user: User;
  appointments: Appointment[];
  healthMetrics: HealthMetric[];
  alerts: Alert[];
  onNavigate: (page: string) => void;
}

export function DashboardPage({
  user,
  appointments,
  healthMetrics,
  alerts,
  onNavigate
}: DashboardPageProps) {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    // Map page names to routes
    const routeMap: Record<string, string> = {
      'dashboard': ROUTES.PATIENT_DASHBOARD,
      'profile': ROUTES.PATIENT_PROFILE,
      'appointments': ROUTES.PATIENT_APPOINTMENTS,
      'telehealth': ROUTES.PATIENT_TELEHEALTH,
      'monitoring': ROUTES.PATIENT_MONITORING,
      'ai-assistant': ROUTES.PATIENT_AI_ASSISTANT,
      'community': ROUTES.PATIENT_COMMUNITY
    };
    
    const route = routeMap[page];
    if (route) {
      router.push(route);
    }
    // Also call the parent onNavigate if provided
    onNavigate(page);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <WelcomeSection userName={user.name} />

      {/* Quick Actions */}
      <QuickActions onNavigate={handleNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Metrics Card */}
          <HealthMetrics metrics={healthMetrics} onNavigate={handleNavigate} />

          {/* Recent Consultations */}
          <RecentConsultations consultations={[]} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <TodaySchedule appointments={appointments} onNavigate={handleNavigate} />

          {/* Medication Reminders */}
          <MedicationReminders reminders={[]} />
        </div>
      </div>

      {/* Suggested Articles */}
      <SuggestedArticles articles={[]} onNavigate={handleNavigate} />
    </div>
  );
}

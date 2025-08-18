"use client";

import React from 'react';
import { WelcomeSection } from '../components/WelcomeSection';
import { QuickActions } from '../components/QuickActions';
import { HealthMetrics } from '../components/HealthMetrics';
import { TodaySchedule } from '../components/TodaySchedule';
import { MedicationReminders } from '../components/MedicationReminders';
import { RecentConsultations } from '../components/RecentConsultations';
import { SuggestedArticles } from '../components/SuggestedArticles';
import { User, Appointment, HealthMetric } from '../types';

interface DashboardPageProps {
  user: User;
  appointments: Appointment[];
  healthMetrics: HealthMetric[];
  onNavigate: (page: string) => void;
}

export function DashboardPage({
  user,
  appointments,
  healthMetrics,
  onNavigate
}: DashboardPageProps) {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <WelcomeSection userName={user.name} />

      {/* Quick Actions */}
      <QuickActions onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Metrics Card */}
          <HealthMetrics metrics={healthMetrics} onNavigate={onNavigate} />

          {/* Recent Consultations */}
          <RecentConsultations consultations={[]} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <TodaySchedule appointments={appointments} onNavigate={onNavigate} />

          {/* Medication Reminders */}
          <MedicationReminders reminders={[]} />
        </div>
      </div>

      {/* Suggested Articles */}
      <SuggestedArticles articles={[]} onNavigate={onNavigate} />
    </div>
  );
}

"use client";

import React from "react";
import { usePatientNavigation } from "@/hooks/navigation";
import { WelcomeSection } from "../components/WelcomeSection";
import { QuickActions } from "../components/QuickActions";
import { HealthMetrics } from "../components/HealthMetrics";
import { TodaySchedule } from "../components/TodaySchedule";
import { MedicationReminders } from "../components/MedicationReminders";
import { RecentConsultations } from "../components/RecentConsultations";
import { SuggestedArticles } from "../components/SuggestedArticles";
import {
  User,
  Appointment,
  HealthMetric,
  Alert,
  Consultation,
  MedicationReminder,
  Article,
} from "../types";

interface DashboardPageProps {
  user: User;
  appointments: Appointment[];
  healthMetrics: HealthMetric[];
  alerts: Alert[];
  consultations: Consultation[];
  reminders: MedicationReminder[];
  articles: Article[];
  onNavigate?: (page: string) => void;
}

export function DashboardPage({
  user,
  appointments,
  healthMetrics,
  alerts,
  consultations,
  reminders,
  articles,
  onNavigate,
}: DashboardPageProps) {
  const { navigate } = usePatientNavigation();

  const handleNavigate = (page: string) => {
    navigate(page as any);
    onNavigate?.(page);
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
          <RecentConsultations consultations={consultations} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <TodaySchedule
            appointments={appointments}
            onNavigate={handleNavigate}
          />

          {/* Medication Reminders */}
          <MedicationReminders reminders={reminders} />
        </div>
      </div>

      {/* Suggested Articles */}
      <SuggestedArticles articles={articles} onNavigate={handleNavigate} />
    </div>
  );
}

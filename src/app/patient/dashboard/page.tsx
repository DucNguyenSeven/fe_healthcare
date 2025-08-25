"use client";

import React from 'react';
import { DashboardPage } from '@/features/patient';
import { usePatient } from '@/hooks/usePatient';

// Using centralized mock data

export default function PatientDashboardPage() {
  const { user, appointments, healthMetrics, alerts, consultations, reminders, articles } = usePatient();
  const handleNavigate = (page: string) => {
    // In a real app, this would use Next.js router
    console.log('Navigating to:', page);
    // For now, we'll just log the navigation
    // You can implement actual navigation using Next.js router here
  };

  return (
    <DashboardPage
      user={user}
      appointments={appointments}
      healthMetrics={healthMetrics}
      alerts={alerts}
      consultations={consultations}
      reminders={reminders}
      articles={articles}
      onNavigate={handleNavigate}
    />
  );
}

"use client";

import React from 'react';
import { DashboardPage } from '@/features/patient';
import { mockUser, mockAppointments, mockHealthMetrics, mockAlerts, mockConsultations, mockMedicationReminders, mockArticles } from '@/data/global/patient.data';

// Using centralized mock data

export default function PatientDashboardPage() {
  const handleNavigate = (page: string) => {
    // In a real app, this would use Next.js router
    console.log('Navigating to:', page);
    // For now, we'll just log the navigation
    // You can implement actual navigation using Next.js router here
  };

  return (
    <DashboardPage
      user={mockUser}
      appointments={mockAppointments}
      healthMetrics={mockHealthMetrics}
      alerts={mockAlerts}
      consultations={mockConsultations}
      reminders={mockMedicationReminders}
      articles={mockArticles}
      onNavigate={handleNavigate}
    />
  );
}

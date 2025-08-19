"use client";

import React from 'react';
import { DashboardLayout } from '@/features/patient';
import { mockUser } from '@/data/global/patient.data';

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <DashboardLayout user={mockUser}>
      {children}
    </DashboardLayout>
  );
}

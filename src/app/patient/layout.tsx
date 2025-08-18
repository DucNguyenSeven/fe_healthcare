"use client";

import React from 'react';
import { DashboardLayout } from '@/features/patient';

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  // Mock user data - in a real app, this would come from auth context
  const mockUser = {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '0123456789',
    avatar: '/api/placeholder/40/40',
    ckdStage: 3,
    lastEgfr: 45,
    lastCreatinine: 1.8,
    lastBp: '140/90'
  };

  return (
    <DashboardLayout user={mockUser}>
      {children}
    </DashboardLayout>
  );
}

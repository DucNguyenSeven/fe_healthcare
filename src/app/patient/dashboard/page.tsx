"use client";

import React, { useState } from 'react';
import { DashboardLayout, DashboardPage, User, Appointment, HealthMetric } from '@/features/patient';

// Mock data
const mockUser: User = {
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

const mockAppointments: Appointment[] = [
  {
    id: '1',
    type: 'online',
    service: 'Tư vấn thận học',
    doctor: 'BS. Trần Minh Hoàng',
    date: '2024-01-15',
    time: '14:00',
    status: 'upcoming',
    canJoin: true
  },
  {
    id: '2',
    type: 'direct',
    service: 'Khám tổng quát',
    doctor: 'BS. Lê Thị Mai',
    date: '2024-01-20',
    time: '09:30',
    status: 'upcoming'
  }
];

const mockHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    type: 'egfr',
    value: 45,
    date: '2024-01-10',
    unit: 'mL/min/1.73m²',
    isAlert: true
  },
  {
    id: '2',
    type: 'creatinine',
    value: 1.8,
    date: '2024-01-10',
    unit: 'mg/dL',
    isAlert: true
  },
  {
    id: '3',
    type: 'bp',
    value: '140/90',
    date: '2024-01-10',
    unit: 'mmHg',
    isAlert: true
  },
  {
    id: '4',
    type: 'weight',
    value: 68,
    date: '2024-01-10',
    unit: 'kg'
  }
];

export default function PatientDashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Trong thực tế, bạn sẽ navigate đến page khác
    console.log('Navigate to:', page);
  };

  return (
    <DashboardLayout
      user={mockUser}
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      <DashboardPage
        user={mockUser}
        appointments={mockAppointments}
        healthMetrics={mockHealthMetrics}
        onNavigate={handleNavigate}
      />
    </DashboardLayout>
  );
}

"use client";

import React from 'react';
import { DashboardPage, User, Appointment, HealthMetric, Alert } from '@/features/patient';

// Mock user data
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

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Chỉ số eGFR thấp',
    message: 'eGFR 45 mL/min/1.73m² - dưới ngưỡng an toàn. Vui lòng liên hệ bác sĩ.',
    date: '2024-01-10',
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Huyết áp cao',
    message: 'Huyết áp 140/90 mmHg - vượt ngưỡng khuyến nghị.',
    date: '2024-01-10',
    isRead: false
  }
];

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
      onNavigate={handleNavigate}
    />
  );
}

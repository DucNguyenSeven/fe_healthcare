"use client";

import React from 'react';
import { MonitoringPage, User, HealthMetric } from '@/features/patient';

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

// Mock health metrics data
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

export default function MonitoringPageRoute() {
  return <MonitoringPage user={mockUser} healthMetrics={mockHealthMetrics} />;
}

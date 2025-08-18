"use client";

import React from 'react';
import { TelehealthPage, User, Appointment } from '@/features/patient';

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

// Mock appointments data
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

export default function TelehealthPageRoute() {
  return <TelehealthPage user={mockUser} appointments={mockAppointments} />;
}

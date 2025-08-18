"use client";

import React from 'react';
import { AppointmentsPage, Appointment } from '@/features/patient';

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
  },
  {
    id: '3',
    type: 'online',
    service: 'Tư vấn dinh dưỡng',
    doctor: 'BS. Nguyễn Văn Đức',
    date: '2024-01-10',
    time: '15:00',
    status: 'completed'
  }
];

export default function AppointmentsPageRoute() {
  return <AppointmentsPage appointments={mockAppointments} />;
}

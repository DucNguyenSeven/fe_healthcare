"use client";

import React from 'react';
import { AppointmentsPage, Appointment } from '@/features/patient';
import { mockAppointments } from '@/data/global/patient.data';

// Using centralized mock appointments

export default function AppointmentsPageRoute() {
  return <AppointmentsPage appointments={mockAppointments} />;
}

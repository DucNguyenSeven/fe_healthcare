"use client";

import React from 'react';
import { TelehealthPage, User, Appointment } from '@/features/patient';
import { mockUser, mockAppointments } from '@/data/global/patient.data';

// Using centralized mock user & appointments

export default function TelehealthPageRoute() {
  return <TelehealthPage user={mockUser} appointments={mockAppointments} />;
}

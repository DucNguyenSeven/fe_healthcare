"use client";

import React from 'react';
import { AppointmentsPage } from '@/features/patient';
import { usePatient } from '@/hooks/usePatient';

// Using centralized mock appointments

export default function AppointmentsPageRoute() {
  const { appointments } = usePatient();
  return <AppointmentsPage appointments={appointments} />;
}

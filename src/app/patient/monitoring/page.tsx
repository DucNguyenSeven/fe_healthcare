"use client";

import React from 'react';
import { MonitoringPage } from '@/features/patient';
import { usePatient } from '@/hooks/usePatient';

// Using centralized mock user & health metrics

export default function MonitoringPageRoute() {
  const { user, healthMetrics } = usePatient();
  return <MonitoringPage user={user} healthMetrics={healthMetrics} />;
}

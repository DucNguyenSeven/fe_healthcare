"use client";

import React from 'react';
import { MonitoringPage, User, HealthMetric } from '@/features/patient';
import { mockUser, mockHealthMetrics } from '@/data/global/patient.data';

// Using centralized mock user & health metrics

export default function MonitoringPageRoute() {
  return <MonitoringPage user={mockUser} healthMetrics={mockHealthMetrics} />;
}

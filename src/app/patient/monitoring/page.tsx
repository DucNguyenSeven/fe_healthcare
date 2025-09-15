'use client'

import { MonitoringPage } from '@/features/patient'
import { mockUser, mockHealthMetrics } from '@/data/mock/patient-data'

export default function PatientMonitoring() {
  return <MonitoringPage user={mockUser} healthMetrics={mockHealthMetrics} />
}

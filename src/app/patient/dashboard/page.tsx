'use client'

import { DashboardPage } from '@/features/patient'
import { mockUser, mockAppointments, mockHealthMetrics, mockAlerts } from '@/data/mock/patient-data'

export default function PatientDashboard() {
  const handleNavigate = (page: string) => {
    // TODO: Implement navigation logic when needed
    // Navigate to page
  }

  return (
    <DashboardPage 
      user={mockUser}
      appointments={mockAppointments}
      healthMetrics={mockHealthMetrics}
      alerts={mockAlerts}
      onNavigate={handleNavigate}
    />
  )
}

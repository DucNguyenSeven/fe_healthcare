'use client'

import { AppointmentsPage } from '@/features/patient'
import { mockAppointments } from '@/data/mock/patient-data'

export default function PatientAppointments() {
  return <AppointmentsPage appointments={mockAppointments} />
}

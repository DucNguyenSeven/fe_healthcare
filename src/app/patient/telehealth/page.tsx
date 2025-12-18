'use client'

import { TelehealthPage } from '@/features/patient'
import { mockUser, mockAppointments } from '@/data/mock/patient-data'

export default function PatientTelehealth() {
  return <TelehealthPage user={mockUser} appointments={mockAppointments} />
}

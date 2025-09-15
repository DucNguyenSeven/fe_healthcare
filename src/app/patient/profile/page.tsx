'use client'

import { ProfileRecordsPage } from '@/features/patient'
import { mockUser } from '@/data/mock/patient-data'

export default function PatientProfile() {
  return <ProfileRecordsPage user={mockUser} />
}

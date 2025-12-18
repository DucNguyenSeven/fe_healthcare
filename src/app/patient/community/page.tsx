'use client'

import { CommunityPage } from '@/features/patient'
import { mockUser } from '@/data/mock/patient-data'

export default function PatientCommunity() {
  return <CommunityPage user={mockUser} />
}

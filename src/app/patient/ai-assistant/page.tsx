'use client'

import { AIAssistantPage } from '@/features/patient'
import { mockUser } from '@/data/mock/patient-data'

export default function PatientAIAssistant() {
  const handleNavigate = (page: 'appointments') => {
    // TODO: Implement navigation logic when needed
    console.log('Navigate to:', page)
  }

  return <AIAssistantPage user={mockUser} onNavigate={handleNavigate} />
}

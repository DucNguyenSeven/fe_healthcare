'use client'

import { useRouter } from 'next/navigation'
import { AIAssistantPage } from '@/features/patient'
import { mockUser } from '@/data/mock/patient-data'

export default function PatientAIAssistant() {
  const router = useRouter()
  
  const handleNavigate = (page: 'appointments') => {
    if (page === 'appointments') {
      router.push('/patient/appointments')
    }
  }

  return <AIAssistantPage user={mockUser} onNavigate={handleNavigate} />
}

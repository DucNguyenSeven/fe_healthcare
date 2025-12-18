'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PatientPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard by default
    router.replace('/patient/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

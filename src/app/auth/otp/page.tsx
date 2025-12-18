'use client'

import React, { Suspense } from 'react'
import { OTPPageWrapper } from '@/features/auth/OTPPageWrapper'

function OTPPageContent() {
  return <OTPPageWrapper />
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OTPPageContent />
    </Suspense>
  )
}

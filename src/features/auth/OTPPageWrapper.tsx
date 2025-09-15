'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthPageLayout } from './AuthPageLayout'
import { OTPForm } from './OTPForm'
import { ROUTES } from '@/constants/routes'

const otpQuote = {
  text: "Niềm tin của bạn – Sứ mệnh của chúng tôi",
  author: "Healthcare+"
}

const healthcareIllustration = "/assets/images/login_hero_doctor_patient.png"

export const OTPPageWrapper = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userEmail = searchParams.get('email') || ''

  const handleNavigate = (page: 'login' | 'register' | 'forgot-password' | 'otp', email?: string) => {
    switch (page) {
      case 'login':
        router.push(ROUTES.AUTH.LOGIN)
        break
      case 'register':
        router.push(ROUTES.AUTH.REGISTER)
        break
      case 'forgot-password':
        router.push(ROUTES.AUTH.FORGOT_PASSWORD)
        break
      default:
        router.push(ROUTES.AUTH.OTP)
    }
  }

  return (
    <AuthPageLayout quote={otpQuote} illustration={healthcareIllustration}>
      <OTPForm onNavigate={handleNavigate} userEmail={userEmail} />
    </AuthPageLayout>
  )
}

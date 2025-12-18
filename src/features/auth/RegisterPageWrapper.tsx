'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuthPageLayout } from './AuthPageLayout'
import { RegisterForm } from './RegisterForm'
import { ROUTES } from '@/constants/routes'

const registerQuote = {
  text: "Đồng hành chăm sóc, sống trọn từng ngày",
  author: "Healthcare+"
}

const healthcareIllustration = "/assets/images/register_hero_doctor_patient.png"

export const RegisterPageWrapper = () => {
  const router = useRouter()

  const handleNavigate = (page: 'login' | 'register' | 'forgot-password' | 'otp', email?: string) => {
    switch (page) {
      case 'login':
        router.push(ROUTES.AUTH.LOGIN)
        break
      case 'forgot-password':
        router.push(ROUTES.AUTH.FORGOT_PASSWORD)
        break
      case 'otp':
        // Pass email as query parameter
        router.push(`${ROUTES.AUTH.OTP}?email=${encodeURIComponent(email || '')}`)
        break
      default:
        router.push(ROUTES.AUTH.REGISTER)
    }
  }

  return (
    <AuthPageLayout quote={registerQuote} illustration={healthcareIllustration}>
      <RegisterForm onNavigate={handleNavigate} />
    </AuthPageLayout>
  )
}

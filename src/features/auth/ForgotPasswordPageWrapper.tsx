'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuthPageLayout } from './AuthPageLayout'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { ROUTES } from '@/constants/routes'

const forgotPasswordQuote = {
  text: "Sức khỏe hôm nay, hạnh phúc ngày mai",
  author: "Healthcare+"
}

const healthcareIllustration = "/assets/images/login_hero_doctor_patient.png"

export const ForgotPasswordPageWrapper = () => {
  const router = useRouter()

  const handleNavigate = (page: 'login' | 'register' | 'forgot-password' | 'otp-forgot-password', email?: string) => {
    switch (page) {
      case 'login':
        router.push(ROUTES.AUTH.LOGIN)
        break
      case 'register':
        router.push(ROUTES.AUTH.REGISTER)
        break
      case 'otp-forgot-password':
        // Navigate to forgot password OTP page without exposing email in URL
        router.push(ROUTES.AUTH.OTP_FORGOT_PASSWORD)
        break
      default:
        router.push(ROUTES.AUTH.FORGOT_PASSWORD)
    }
  }

  return (
    <AuthPageLayout quote={forgotPasswordQuote} illustration={healthcareIllustration}>
      <ForgotPasswordForm onNavigate={handleNavigate} />
    </AuthPageLayout>
  )
}

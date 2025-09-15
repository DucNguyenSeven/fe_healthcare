'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AuthPageLayout } from './AuthPageLayout'
import { LoginForm } from './LoginForm'
import { ROUTES } from '@/constants/routes'
import { getUserRole, getDefaultRedirectPath } from '@/lib/utils/auth'

const loginQuote = {
  text: "Yên tâm nhé, chúng tôi luôn ở bên khi bạn cần",
  author: "Healthcare+"
}

const healthcareIllustration = "/assets/images/login_hero_doctor_patient.png"

export const LoginPageWrapper = () => {
  const router = useRouter()

  const handleNavigate = (page: 'login' | 'register' | 'forgot-password' | 'otp', email?: string) => {
    switch (page) {
      case 'register':
        router.push(ROUTES.AUTH.REGISTER)
        break
      case 'forgot-password':
        router.push(ROUTES.AUTH.FORGOT_PASSWORD)
        break
      case 'otp':
        // Pass email as query parameter
        router.push(`${ROUTES.AUTH.OTP}?email=${encodeURIComponent(email || '')}`)
        break
      default:
        router.push(ROUTES.AUTH.LOGIN)
    }
  }

  const handleLoginSuccess = (email: string) => {
    console.log('Đăng nhập thành công với email:', email)
    // useLogin hook sẽ tự động handle redirect dựa trên role
    // Không cần handle redirect tại đây nữa
  }

  return (
    <AuthPageLayout quote={loginQuote} illustration={healthcareIllustration}>
      <LoginForm onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
    </AuthPageLayout>
  )
}

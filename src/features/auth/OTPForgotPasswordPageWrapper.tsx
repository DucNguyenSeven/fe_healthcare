'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthPageLayout } from './AuthPageLayout'
import { OTPForgotPasswordForm } from './OTPForgotPasswordForm'
import { ROUTES } from '@/constants/routes'

const otpForgotPasswordQuote = {
  text: "Đặt lại mật khẩu - Bắt đầu hành trình mới",
  author: "Healthcare+"
}

const healthcareIllustration = "/assets/images/login_hero_doctor_patient.png"

export const OTPForgotPasswordPageWrapper = () => {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem('forgot-password-email')
    const timestamp = sessionStorage.getItem('forgot-password-timestamp')
    
    if (!storedEmail || !timestamp) {
      // If no email or timestamp found, redirect to forgot password page
      router.push(ROUTES.AUTH.FORGOT_PASSWORD)
      return
    }

    // Check if session is still valid (30 minutes)
    const sessionAge = Date.now() - parseInt(timestamp)
    const maxAge = 30 * 60 * 1000 // 30 minutes in milliseconds
    
    if (sessionAge > maxAge) {
      // Session expired, clear storage and redirect
      sessionStorage.removeItem('forgot-password-email')
      sessionStorage.removeItem('forgot-password-timestamp')
      router.push(ROUTES.AUTH.FORGOT_PASSWORD)
      return
    }

    setUserEmail(storedEmail)
    setIsLoading(false)
  }, [router])

  const handleNavigate = (page: 'login' | 'register' | 'forgot-password' | 'reset-password', email?: string, otp?: string) => {
    switch (page) {
      case 'login':
        // Clear session storage when going to login
        sessionStorage.removeItem('forgot-password-email')
        sessionStorage.removeItem('forgot-password-timestamp')
        router.push(ROUTES.AUTH.LOGIN)
        break
      case 'register':
        // Clear session storage when going to register
        sessionStorage.removeItem('forgot-password-email')
        sessionStorage.removeItem('forgot-password-timestamp')
        router.push(ROUTES.AUTH.REGISTER)
        break
      case 'forgot-password':
        // Don't clear session storage when going back to forgot password
        router.push(ROUTES.AUTH.FORGOT_PASSWORD)
        break
      case 'reset-password':
        // Store OTP in sessionStorage for reset password page
        if (email && otp) {
          sessionStorage.setItem('reset-password-email', email)
          sessionStorage.setItem('reset-password-otp', otp)
          sessionStorage.setItem('reset-password-timestamp', Date.now().toString())
        }
        // Clear forgot password session
        sessionStorage.removeItem('forgot-password-email')
        sessionStorage.removeItem('forgot-password-timestamp')
        // Navigate to reset password page
        router.push(ROUTES.AUTH.RESET_PASSWORD)
        break
      default:
        router.push(ROUTES.AUTH.FORGOT_PASSWORD)
    }
  }

  if (isLoading) {
    return (
      <AuthPageLayout quote={otpForgotPasswordQuote} illustration={healthcareIllustration}>
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-6 px-7">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </AuthPageLayout>
    )
  }

  if (!userEmail) {
    return null // This shouldn't happen as we redirect above, but just in case
  }

  return (
    <AuthPageLayout quote={otpForgotPasswordQuote} illustration={healthcareIllustration}>
      <OTPForgotPasswordForm onNavigate={handleNavigate} userEmail={userEmail} />
    </AuthPageLayout>
  )
}

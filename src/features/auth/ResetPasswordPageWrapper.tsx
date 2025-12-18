'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthPageLayout } from './AuthPageLayout'
import { ResetPasswordForm } from './ResetPasswordForm'
import { ROUTES } from '@/constants/routes'

const resetPasswordQuote = {
  text: "Bước đầu mới - Hành trình sức khỏe mới",
  author: "Healthcare+"
}

const healthcareIllustration = "/assets/images/login_hero_doctor_patient.png"

export const ResetPasswordPageWrapper = () => {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [userOtp, setUserOtp] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get email and OTP from sessionStorage
    const storedEmail = sessionStorage.getItem('reset-password-email')
    const storedOtp = sessionStorage.getItem('reset-password-otp')
    const timestamp = sessionStorage.getItem('reset-password-timestamp')
    
    if (!storedEmail || !storedOtp || !timestamp) {
      // If no email, OTP, or timestamp found, redirect to forgot password page
      router.push(ROUTES.AUTH.FORGOT_PASSWORD)
      return
    }

    // Check if session is still valid (15 minutes for reset password)
    const sessionAge = Date.now() - parseInt(timestamp)
    const maxAge = 15 * 60 * 1000 // 15 minutes in milliseconds
    
    if (sessionAge > maxAge) {
      // Session expired, clear storage and redirect
      sessionStorage.removeItem('reset-password-email')
      sessionStorage.removeItem('reset-password-otp')
      sessionStorage.removeItem('reset-password-timestamp')
      router.push(ROUTES.AUTH.FORGOT_PASSWORD)
      return
    }

    setUserEmail(storedEmail)
    setUserOtp(storedOtp)
    setIsLoading(false)
  }, [router])

  const handleNavigate = (page: 'login' | 'register' | 'forgot-password') => {
    // Clear session storage when navigating away
    sessionStorage.removeItem('reset-password-email')
    sessionStorage.removeItem('reset-password-otp')
    sessionStorage.removeItem('reset-password-timestamp')
    
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
        router.push(ROUTES.AUTH.LOGIN)
    }
  }

  if (isLoading) {
    return (
      <AuthPageLayout quote={resetPasswordQuote} illustration={healthcareIllustration}>
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] py-6 px-7">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </AuthPageLayout>
    )
  }

  if (!userEmail || !userOtp) {
    return null // This shouldn't happen as we redirect above, but just in case
  }

  return (
    <AuthPageLayout quote={resetPasswordQuote} illustration={healthcareIllustration}>
      <ResetPasswordForm 
        onNavigate={handleNavigate} 
        userEmail={userEmail} 
        userOtp={userOtp}
      />
    </AuthPageLayout>
  )
}

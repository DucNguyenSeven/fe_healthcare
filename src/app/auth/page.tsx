'use client'

import { AuthPages } from '../../features/auth'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleLoginSuccess = (email: string) => {
    console.log('Login with email:', email)
    if (email.toLowerCase().trim() === 'patient') {
      router.push('/patient')
    } else if (email.toLowerCase().trim() === 'doctor') {
      router.push('/doctor')
    } else {
      // Default to patient app for any other email
      router.push('/patient')
    }
  }

  return (
    <AuthPages 
      onBackToHome={handleBackToHome} 
      onLoginSuccess={handleLoginSuccess} 
    />
  )
}

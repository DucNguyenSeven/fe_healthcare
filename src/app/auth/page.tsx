'use client'

import { AuthPages } from '../../features/auth'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { getUserRole, getDefaultRedirectPath } from '@/lib/utils/auth'

export default function AuthPage() {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push(ROUTES.HOME)
  }

  const handleLoginSuccess = (email: string) => {
    console.log('Login with email:', email)
    
    // Lấy role đã được lưu trong useAuth hook
    const userRole = getUserRole()
    
    if (userRole) {
      const redirectPath = getDefaultRedirectPath(userRole)
      router.push(redirectPath)
    } else {
      // Fallback logic dựa trên email (cho demo)
      const emailLower = email.toLowerCase().trim()
      if (emailLower === 'patient') {
        router.push(ROUTES.PATIENT.ROOT)
      } else if (emailLower === 'doctor') {
        router.push(ROUTES.DOCTOR.ROOT)
      } else {
        // Default to patient app for any other email
        router.push(ROUTES.PATIENT.ROOT)
      }
    }
  }

  return (
    <AuthPages 
      onBackToHome={handleBackToHome} 
      onLoginSuccess={handleLoginSuccess} 
    />
  )
}

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
      // Mặc định chuyển vào ứng dụng bệnh nhân khi chưa có role
      router.push(ROUTES.PATIENT.ROOT)
    }
  }

  return (
    <AuthPages 
      onBackToHome={handleBackToHome} 
      onLoginSuccess={handleLoginSuccess} 
    />
  )
}

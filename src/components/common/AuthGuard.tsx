'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/utils/auth/token'
import { ROUTES } from '@/constants/routes'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  redirectTo = ROUTES.AUTH.ROOT 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken()
      
      if (!token) {
        setIsAuthenticated(false)
        router.push(redirectTo)
        return
      }

      // TODO: Có thể thêm validation token với backend nếu cần
      setIsAuthenticated(true)
    }

    checkAuth()
  }, [router, redirectTo])

  // Hiển thị loading trong khi kiểm tra auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Không hiển thị gì nếu chưa đăng nhập (đang redirect)
  if (!isAuthenticated) {
    return null
  }

  // Hiển thị children nếu đã đăng nhập
  return <>{children}</>
}

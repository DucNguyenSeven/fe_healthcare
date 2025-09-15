'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserRole, hasRole } from '@/lib/utils/auth'

interface RoleGuardProps {
  children: React.ReactNode
  allow: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function RoleGuard({ 
  children, 
  allow, 
  redirectTo = '/auth',
  fallback
}: RoleGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkRole = () => {
      const userRole = getUserRole()
      
      if (userRole && hasRole(allow)) {
        setHasPermission(true)
      } else {
        setHasPermission(false)
        if (redirectTo) {
          router.push(redirectTo)
        }
      }
    }

    checkRole()
  }, [allow, router, redirectTo])

  // Hiển thị loading trong khi kiểm tra role
  if (hasPermission === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Hiển thị fallback hoặc không hiển thị gì nếu không có quyền
  if (!hasPermission) {
    return fallback || null
  }

  // Hiển thị children nếu có quyền
  return <>{children}</>
}

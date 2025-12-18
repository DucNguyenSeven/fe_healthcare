'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page by default
    router.replace(ROUTES.AUTH.LOGIN)
  }, [router])

  return null
}

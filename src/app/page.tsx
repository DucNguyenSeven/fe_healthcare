'use client'

import { HealthcarePlusLandingPage } from '../features/landing'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function HomePage() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push(ROUTES.AUTH.ROOT)
  }

  return <HealthcarePlusLandingPage onLoginClick={handleLoginClick} />
}
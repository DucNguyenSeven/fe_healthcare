'use client'

import { HealthcarePlusLandingPage } from '../features/landing'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/auth')
  }

  return <HealthcarePlusLandingPage onLoginClick={handleLoginClick} />
}
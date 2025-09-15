'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppLayout } from './AppLayout'
import { NavigationItem } from './HealthcarePlusApp'
import { mockUser, mockAlerts } from '@/data/mock/patient-data'

interface PatientLayoutWrapperProps {
  children: React.ReactNode
}

export function PatientLayoutWrapper({ children }: PatientLayoutWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Determine current page from pathname
  const getCurrentPage = (): NavigationItem => {
    if (pathname.includes('/dashboard')) return 'dashboard'
    if (pathname.includes('/profile')) return 'profile'
    if (pathname.includes('/appointments')) return 'appointments'
    if (pathname.includes('/telehealth')) return 'telehealth'
    if (pathname.includes('/monitoring')) return 'monitoring'
    if (pathname.includes('/ai-assistant')) return 'ai-assistant'
    if (pathname.includes('/community')) return 'community'
    return 'dashboard' // default
  }

  // Navigate using Next.js router
  const handleNavigate = (page: NavigationItem) => {
    const routes = {
      dashboard: '/patient/dashboard',
      profile: '/patient/profile',
      appointments: '/patient/appointments',
      telehealth: '/patient/telehealth',
      monitoring: '/patient/monitoring',
      'ai-assistant': '/patient/ai-assistant',
      community: '/patient/community'
    }
    
    router.push(routes[page])
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Count unread alerts for notification badge
  const alertCount = mockAlerts.filter(alert => !alert.isRead).length

  return (
    <AppLayout
      user={mockUser}
      currentPage={getCurrentPage()}
      onNavigate={handleNavigate}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={handleToggleSidebar}
      alertCount={alertCount}
    >
      {children}
    </AppLayout>
  )
}

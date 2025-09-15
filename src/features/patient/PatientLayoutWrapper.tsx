'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppLayout } from './AppLayout'
import { NavigationItem } from './HealthcarePlusApp'
import { mockAlerts } from '@/data/mock/patient-data'
import { useGetMe } from '@/hooks/auth/useGetMe'

interface PatientLayoutWrapperProps {
  children: React.ReactNode
}

export function PatientLayoutWrapper({ children }: PatientLayoutWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Get real user data from API
  const { data: userData, isLoading: isUserLoading, error: userError } = useGetMe()

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

  // Transform API user data to match AppLayout interface
  const transformedUser = userData ? {
    id: userData.userId,
    name: userData.fullName || 'Người dùng',
    avatar: userData.avatarUrl || '/api/placeholder/32/32',
    email: userData.email || '',
    phone: userData.phone || '',
    ckdStage: 3, // Default mock data - có thể cập nhật từ API sau
    lastEgfr: 45, // Default mock data
    lastCreatinine: 1.8, // Default mock data
    lastBp: '140/90' // Default mock data
  } : {
    id: '1',
    name: 'Đang tải...',
    avatar: '/api/placeholder/32/32',
    email: '',
    phone: '',
    ckdStage: 3,
    lastEgfr: 45,
    lastCreatinine: 1.8,
    lastBp: '140/90'
  }

  // Show loading state if user data is still loading
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#1E75FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  // Show error state if there's an error loading user data
  if (userError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải thông tin người dùng</h3>
          <p className="text-gray-600 mb-4">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppLayout
      user={transformedUser}
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

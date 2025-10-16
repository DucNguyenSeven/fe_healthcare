'use client'

import { DashboardPage } from '@/features/patient'
import { useGetMe } from '@/hooks/auth/useGetMe'
import { mockAppointments, mockHealthMetrics, mockAlerts } from '@/data/mock/patient-data'
import { useAuthContext } from '@/contexts/AuthContext'

export default function PatientDashboard() {
  const { user: authUser } = useAuthContext()
  const { data: userData, isLoading } = useGetMe()
  
  const handleNavigate = (page: string) => {
    // TODO: Implement navigation logic when needed
    // Navigate to page
  }

  // Use real user data from getMe API, fallback to auth context, then mock data
  const user = userData ? {
    id: userData.userId,
    name: userData.fullName || userData.email || 'Bạn',
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone || '',
    avatar: userData.avatarUrl || undefined,
    ckdStage: 1, // Default value, should be calculated from health metrics
    lastEgfr: 0,
    lastCreatinine: 0,
    lastBp: '0/0'
  } : authUser ? {
    id: authUser.userId,
    name: authUser.name || authUser.fullName || 'Bạn',
    fullName: authUser.fullName,
    email: authUser.email,
    phone: authUser.phone || '',
    avatar: authUser.avatar || authUser.avatarUrl || undefined,
    ckdStage: 1,
    lastEgfr: 0,
    lastCreatinine: 0,
    lastBp: '0/0'
  } : {
    id: 'mock',
    name: 'Bạn',
    fullName: 'Bạn',
    email: '',
    phone: '',
    ckdStage: 1,
    lastEgfr: 0,
    lastCreatinine: 0,
    lastBp: '0/0'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardPage 
      user={user}
      appointments={mockAppointments}
      healthMetrics={mockHealthMetrics}
      alerts={mockAlerts}
      onNavigate={handleNavigate}
    />
  )
}

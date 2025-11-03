'use client'

import { useRouter } from 'next/navigation'
import { AIAssistantPage } from '@/features/patient'
import { useGetMe } from '@/hooks/auth/useGetMe'
import { useAuthContext } from '@/contexts/AuthContext'

export default function PatientAIAssistant() {
  const router = useRouter()
  const { user: authUser } = useAuthContext()
  const { data: userData, isLoading: isLoadingUser } = useGetMe()

  // Get patient ID from user data (same logic as Dashboard)
  const patientId = userData?.userId || authUser?.userId

  // Use real user data from getMe API, fallback to auth context
  const user = userData ? {
    id: userData.userId,
    name: userData.fullName || userData.email || 'Bạn',
    fullName: userData.fullName || undefined,
    email: userData.email,
    phone: userData.phone || '',
    avatar: userData.avatarUrl || undefined,
    // CKD-specific fields (will be updated from API later)
    ckdStage: 3,
    lastEgfr: 45,
    lastCreatinine: 1.8,
    lastBp: '140/90'
  } : authUser ? {
    id: authUser.userId,
    name: authUser.name || authUser.fullName || 'Bạn',
    fullName: authUser.fullName || undefined,
    email: authUser.email,
    phone: authUser.phone || '',
    avatar: authUser.avatar || authUser.avatarUrl || undefined,
    ckdStage: 3,
    lastEgfr: 45,
    lastCreatinine: 1.8,
    lastBp: '140/90'
  } : null

  const handleNavigate = (page: 'appointments') => {
    if (page === 'appointments') {
      router.push('/patient/appointments')
    }
  }

  // Show loading state only for initial user data load
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  // If no user data, show error or redirect to login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để tiếp tục</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return <AIAssistantPage user={user} onNavigate={handleNavigate} />
}

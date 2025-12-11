'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, User, Home, Users, Calendar, Clock, BookOpen, MessageSquare, Activity, ChevronRight } from 'lucide-react'
import { useLogout } from '@/hooks/auth/useLogout'
import { useGetMe } from '@/hooks/auth/useGetMe'
import { toast } from 'sonner'

interface DoctorLayoutWrapperProps {
  children: React.ReactNode
}

type DoctorNavigationItem = 'dashboard' | 'profile' | 'patients' | 'appointments' | 'schedule' | 'forum'

const navigationItems = [{
  id: 'dashboard',
  label: "Tổng quan",
  icon: Home
}, {
  id: 'profile',
  label: 'Hồ sơ cá nhân',
  icon: User
}, {
  id: 'patients',
  label: 'Bệnh nhân',
  icon: Users
}, {
  id: 'appointments',
  label: 'Lịch hẹn',
  icon: Calendar
}, {
  id: 'schedule',
  label: 'Lịch làm việc',
  icon: Clock
}, {
  id: 'forum',
  label: 'Diễn đàn',
  icon: MessageSquare
}]

export function DoctorLayoutWrapper({ children }: DoctorLayoutWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useLogout()
  
  // Get real user data from API
  const { data: userData, isLoading: isUserLoading, error: userError } = useGetMe()

  const handleLogout = () => {
    toast.success('Đăng xuất thành công!', {
      description: 'Hẹn gặp lại bạn',
      duration: 2000,
    });
    logout();
  };

  // Determine current page from pathname
  const getCurrentPage = (): DoctorNavigationItem => {
    if (pathname.includes('/dashboard')) return 'dashboard'
    if (pathname.includes('/profile')) return 'profile'
    if (pathname.includes('/patients')) return 'patients'
    if (pathname.includes('/appointments')) return 'appointments'
    if (pathname.includes('/schedule')) return 'schedule'
    if (pathname.includes('/forum')) return 'forum'
    return 'dashboard' // default
  }

  const activeTab = getCurrentPage()

  // Navigate using Next.js router
  const handleNavigate = (page: DoctorNavigationItem) => {
    const routes = {
      dashboard: '/doctor/dashboard',
      profile: '/doctor/profile',
      patients: '/doctor/patients',
      appointments: '/doctor/appointments',
      schedule: '/doctor/schedule',
      forum: '/doctor/forum'
    }
    
    router.push(routes[page])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 900)) && <motion.aside initial={{
          x: -280
        }} animate={{
          x: 0
        }} exit={{
          x: -280
        }} transition={{
          duration: 0.3
        }} className="w-70 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">HealthCare+</h1>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6">
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return <button key={item.id} onClick={() => {
                  handleNavigate(item.id as DoctorNavigationItem);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }} className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-2
                    ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
                  </button>;
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-red-600 hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>

          </motion.aside>}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6" style={{ paddingTop: '22px', paddingBottom: '22px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
            {/* Hide user info when on profile page, but keep header height */}
            {activeTab !== 'profile' ? (
              <div className="flex items-center space-x-4">
                {/* User Profile in Header - Real data from API */}
                <div className="flex items-center space-x-3">
                  {userData?.avatarUrl ? (
                    <img 
                      src={userData.avatarUrl} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {userData?.fullName ? `BS. ${userData.fullName}` : 'BS. Đang tải...'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Invisible elements to maintain exact same height as when visible */}
                <div className="flex items-center space-x-3 opacity-0 pointer-events-none">
                  <div className="w-8 h-8 rounded-full"></div>
                  <span className="text-sm font-medium">BS. Placeholder</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

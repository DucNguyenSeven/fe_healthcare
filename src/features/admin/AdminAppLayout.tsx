'use client'

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Activity,
  User
} from 'lucide-react';
import { NavigationItem, User as UserType } from './types';
import { useLogout } from '@/hooks/auth/useLogout';
import { toast } from 'sonner';
import { HealthcareSidebarLogo } from '@/shared/ui/HealthcareSidebarLogo';

interface AdminAppLayoutProps {
  user: UserType;
  currentPage: NavigationItem;
  onNavigate: (page: NavigationItem) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  notificationCount: number;
  children: React.ReactNode;
}

interface NavigationItemConfig {
  id: NavigationItem;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItemConfig[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'users', label: 'Quản lý người dùng', icon: Users },
  { id: 'appointments', label: 'Quản lý lịch hẹn', icon: Calendar },
  { id: 'revenue', label: 'Quản lý doanh thu', icon: DollarSign },
  { id: 'payments', label: 'Quản lý thanh toán', icon: CreditCard },
];

export function AdminAppLayout({
  user,
  currentPage,
  onNavigate,
  isSidebarOpen,
  onToggleSidebar,
  notificationCount,
  children
}: AdminAppLayoutProps) {
  const { logout } = useLogout();

  const handleLogout = () => {
    toast.success('Đăng xuất thành công!', {
      description: 'Hẹn gặp lại bạn',
      duration: 2000,
    });
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Close Button */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 relative">
          <HealthcareSidebarLogo />
          <button
            onClick={onToggleSidebar}
            className="lg:hidden absolute right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    onToggleSidebar();
                  }
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />}
              </button>
            );
          })}
        </nav>

        {/* Spacer to push logout to bottom */}
        <div className="flex-1"></div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left
                       transition-all duration-200 text-red-600 hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top App Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Mở menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {navigationItems.find(item => item.id === currentPage)?.label || 'Tổng quan'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`Ảnh đại diện của ${user.name}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

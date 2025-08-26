"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { usePatientNavigation } from "@/hooks/navigation";
import { navigationItems } from "@/features/patient/navigation";
import {
  Activity,
  Settings,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Use shared items (same shape)
const navigationItemsShared = navigationItems as NavigationItem[];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // In Phase 4, consume user from context
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { usePatientContext } = require("../context/PatientContext");
  const { user } = usePatientContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { navigate, currentId } = usePatientNavigation();
  const pathname = usePathname();

  // Determine current page from pathname
  const getCurrentPage = () => {
    const currentPath = pathname;
    const currentItem = navigationItems.find(
      (item) => item.path === currentPath
    );
    return currentItem?.id || "dashboard";
  };

  const currentPage = getCurrentPage() || currentId;

  const handleNavigate = (pageId: string) => navigate(pageId as any);

  const handleLogout = () => {
    // Xử lý đăng xuất ở đây
    console.log("Đăng xuất");
    // Navigate to login
    navigate("dashboard");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
        flex flex-col
      `}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">H+</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">HealthCare+</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation - Fixed height, no scroll */}
        <nav className="px-4 py-6 space-y-2 flex-shrink-0">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavigate(item.id);
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                />
                <span className={`flex-1 ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-blue-700" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200 mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Mở menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {navigationItems.find((item) => item.id === currentPage)
                    ?.label || "Tổng quan"}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Thông báo (2 mới)"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* User Avatar */}
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

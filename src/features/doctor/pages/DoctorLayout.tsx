"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "@/features/doctor/navigation";
import { useDoctorNavigation } from "@/hooks/navigation/useDoctorNavigation";
import { Menu, X, Bell, User, ChevronRight, Activity, LogOut } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { navigate } = useDoctorNavigation();
  const { logout } = useLogout();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthContext();
  const currentLabel =
    navigationItems.find((item) => item.path === pathname)?.label ||
    "Tổng quan";
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          flex flex-col
        `}
      >
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

        <nav className="px-4 py-6 space-y-2 flex-shrink-0">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id as any);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
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
                <span
                  className={`flex-1 ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-blue-700" />
                )}
              </button>
            );
          })}
        </nav>

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

      <div className="flex-1 flex flex-col min-w-0">
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
                  {currentLabel}
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.email ? user.email.split("@")[0] : "Người dùng"}
                </span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

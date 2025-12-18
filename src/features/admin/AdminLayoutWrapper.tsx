"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminAppLayout } from "./AdminAppLayout";
import { NavigationItem } from "./types";
import { useAuthContext } from "@/contexts/AuthContext";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get user data from AuthContext
  const { user, loading } = useAuthContext();

  // Determine current page from pathname
  const getCurrentPage = (): NavigationItem => {
    if (pathname.includes("/dashboard")) return "dashboard";
    if (pathname.includes("/users")) return "users";
    if (pathname.includes("/appointments")) return "appointments";
    if (pathname.includes("/revenue")) return "revenue";
    if (pathname.includes("/payments")) return "payments";
    return "dashboard"; // default
  };

  // Navigate using Next.js router
  const handleNavigate = (page: NavigationItem) => {
    const routes = {
      dashboard: "/admin/dashboard",
      users: "/admin/users",
      appointments: "/admin/appointments",
      revenue: "/admin/revenue",
      payments: "/admin/payments",
    };

    router.push(routes[page]);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Count unread notifications
  const notificationCount = 2; // TODO: Replace với real data

  // Transform user data from context
  const transformedUser = user
    ? {
        id: user.userId,
        name: user.name || "Admin",
        avatar: user.avatar || null,
        email: user.email || "",
        role: user.role || "ADMIN",
      }
    : {
        id: "1",
        name: "Admin",
        avatar: null,
        email: "",
        role: "ADMIN",
      };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAppLayout
      user={transformedUser}
      currentPage={getCurrentPage()}
      onNavigate={handleNavigate}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={handleToggleSidebar}
      notificationCount={notificationCount}
    >
      {children}
    </AdminAppLayout>
  );
}

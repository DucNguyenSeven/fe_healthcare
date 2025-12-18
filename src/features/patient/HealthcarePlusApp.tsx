"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { AppLayout } from "./AppLayout";
import { DashboardPage } from "./DashboardPage";
import { ProfileRecordsPage } from "./ProfileRecordsPage";
import { AppointmentsPage } from "./AppointmentsPage";
import { TelehealthPage } from "./TelehealthPage";
import { MonitoringPage } from "./MonitoringPage";
import { AIAssistantPage } from "./AIAssistantPage";
import { CommunityPage } from "./CommunityPage";
export type NavigationItem =
  | "dashboard"
  | "profile"
  | "appointments"
  | "telehealth"
  | "monitoring"
  | "ai-assistant"
  | "community";
export interface User {
  id: string;
  name: string;
  fullName?: string | null;
  avatar?: string;
  email: string;
  phone: string;
  ckdStage: number;
  lastEgfr: number;
  lastCreatinine: number;
  lastBp: string;
}
export interface Appointment {
  id: string;
  type: "direct" | "online" | "lab_test" | "follow_up";
  service: string;
  doctor: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  canJoin?: boolean;

  patientInfo?: {
    id: string;
    name?: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  symptoms?: string;
  note?: string;
  addressDetail?: string;
  paymentMethod?: "CASH" | "BANK";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
}
export interface HealthMetric {
  id: string;
  type: "egfr" | "creatinine" | "bp" | "weight";
  value: number | string;
  date: string;
  unit: string;
  isAlert?: boolean;
}
export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
export function HealthcarePlusApp() {
  const [currentPage, setCurrentPage] = useState<NavigationItem>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get authenticated user from auth context
  const { user: authUser, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // Handle not authenticated
  if (!isAuthenticated || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-900 font-semibold text-lg mb-2">
            Chưa đăng nhập
          </p>
          <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
        </div>
      </div>
    );
  }

  // Map authenticated user to app User interface
  const user: User = {
    id: authUser.userId,
    name: authUser.fullName || authUser.name || "User",
    fullName: authUser.fullName,
    email: authUser.email,
    phone: authUser.phone || "",
    avatar: authUser.avatarUrl || "/api/placeholder/40/40",
    ckdStage: 3, // Default values (CKD fields not available from auth API)
    lastEgfr: 45, // TODO: Fetch from health metrics API if needed
    lastCreatinine: 1.8,
    lastBp: "140/90",
  };

  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: "1",
      type: "online",
      service: "Tư vấn thận học",
      doctor: "BS. Trần Minh Hoàng",
      date: "2024-01-15",
      time: "14:00",
      status: "upcoming",
      canJoin: true,
    },
    {
      id: "2",
      type: "direct",
      service: "Khám tổng quát",
      doctor: "BS. Lê Thị Mai",
      date: "2024-01-20",
      time: "09:30",
      status: "upcoming",
    },
  ];

  // Mock health metrics
  const healthMetrics: HealthMetric[] = [
    {
      id: "1",
      type: "egfr",
      value: 45,
      date: "2024-01-10",
      unit: "mL/min/1.73m²",
      isAlert: true,
    },
    {
      id: "2",
      type: "creatinine",
      value: 1.8,
      date: "2024-01-10",
      unit: "mg/dL",
      isAlert: true,
    },
    {
      id: "3",
      type: "bp",
      value: "140/90",
      date: "2024-01-10",
      unit: "mmHg",
      isAlert: true,
    },
    {
      id: "4",
      type: "weight",
      value: 68,
      date: "2024-01-10",
      unit: "kg",
    },
  ];

  // Mock alerts
  const alerts: Alert[] = [
    {
      id: "1",
      type: "critical",
      title: "Chỉ số eGFR thấp",
      message:
        "eGFR 45 mL/min/1.73m² - dưới ngưỡng an toàn. Vui lòng liên hệ bác sĩ.",
      date: "2024-01-10",
      isRead: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Huyết áp cao",
      message: "Huyết áp 140/90 mmHg - vượt ngưỡng khuyến nghị.",
      date: "2024-01-10",
      isRead: false,
    },
  ];
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            user={{
              name: user.name,
              fullName: user.fullName ?? undefined,
              email: user.email
            }}
            healthMetrics={[] as any}
            todayAppointments={[]}
            recentConsultations={[]}
            prescriptionGroups={[]}
            onNavigate={(page: string) => setCurrentPage(page as NavigationItem)}
          />
        );
      case "profile":
        return <ProfileRecordsPage />;
      case "appointments":
        return <AppointmentsPage />;
      case "telehealth":
        return <TelehealthPage user={user} appointments={appointments} />;
      case "monitoring":
        return <MonitoringPage />;
      case "ai-assistant":
        return <AIAssistantPage user={user} onNavigate={setCurrentPage} />;
      case "community":
        return <CommunityPage user={user} />;
      default:
        return (
          <DashboardPage
            user={{
              name: user.name,
              fullName: user.fullName ?? undefined,
              email: user.email
            }}
            healthMetrics={[] as any}
            todayAppointments={[]}
            recentConsultations={[]}
            prescriptionGroups={[]}
            onNavigate={(page: string) => setCurrentPage(page as NavigationItem)}
          />
        );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <AppLayout
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        alertCount={alerts.filter((alert) => !alert.isRead).length}
      >
        {renderCurrentPage()}
      </AppLayout>
    </div>
  );
}

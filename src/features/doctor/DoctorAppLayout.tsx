import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  User,
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  Clock,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronDown,
  Activity,
  ChevronRight,
} from "lucide-react";
import { DoctorDashboardPage } from "./DoctorDashboardPage";
import { DoctorProfilePage } from "./DoctorProfilePage";
import { PatientManagementModule } from "./PatientManagementModule";
import { AppointmentAndConsultationModule } from "./AppointmentAndConsultationModule";
import { ForumModule } from "./ForumModule";
const navigationItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: User,
  },
  {
    id: "patients",
    label: "Bệnh nhân",
    icon: Users,
  },
  {
    id: "appointments",
    label: "Lịch hẹn",
    icon: Calendar,
  },
  {
    id: "consultation",
    label: "Tư vấn trực tuyến",
    icon: Video,
  },
  {
    id: "schedule",
    label: "Lịch làm việc",
    icon: Clock,
  },
  {
    id: "forum",
    label: "Diễn đàn",
    icon: MessageSquare,
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: Settings,
  },
] as any[];

// @component: DoctorAppLayout
export const DoctorAppLayout = ({
  initialTab = "dashboard",
}: {
  initialTab?: string;
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DoctorDashboardPage onNavigate={setActiveTab} />;
      case "profile":
        return <DoctorProfilePage />;
      case "patients":
        return <PatientManagementModule />;
      case "appointments":
      case "consultation":
      case "schedule":
        return <AppointmentAndConsultationModule activeView={activeTab} />;
      case "forum":
        return <ForumModule />;
      default:
        return <DoctorDashboardPage onNavigate={setActiveTab} />;
    }
  };

  // @return
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 900) && (
          <motion.aside
            initial={{
              x: -280,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: -280,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
            }}
            className="fixed md:relative z-30 h-full w-64 bg-white shadow-lg flex flex-col"
          >
            {/* Logo & Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">HealthCare+</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
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
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User Profile - Hidden for now */}
            <div
              className="p-4 border-t border-gray-200"
              style={{
                display: "none",
              }}
            >
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Bác sĩ
                  </p>
                  <p className="text-xs text-gray-500">Chuyên khoa Thận</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Mở menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {navigationItems.find((item) => item.id === activeTab)
                    ?.label || "Tổng quan"}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Avatar */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    Bác sĩ
                  </span>
                </button>

                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg py-2 z-50 border border-gray-200"
                    >
                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <span>Hồ sơ cá nhân</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("settings");
                          setProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <span>Cài đặt</span>
                      </button>
                      <hr className="my-2 border-gray-100" />
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600">
                        <span>Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

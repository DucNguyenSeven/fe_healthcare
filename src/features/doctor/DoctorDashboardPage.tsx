import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Video,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  UserPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { useDoctorDashboard } from '@/hooks/dashboard/useDoctorDashboard';
import { APPOINTMENT_STATUS_CONFIG } from '@/types/doctor-dashboard';

const todayStats = [
  {
    label: 'Lịch hẹn hôm nay',
    icon: Calendar,
    color: 'text-[#1E75FF]',
    bg: 'bg-[#1E75FF]/10',
    key: 'todayAppointments' as const
  },
  {
    label: 'Bệnh nhân mới',
    icon: UserPlus,
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10',
    key: 'newPatients' as const
  },
  {
    label: 'Tư vấn hoàn thành',
    icon: CheckCircle,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    key: 'completedConsultations' as const
  },
  {
    label: 'Tổng bệnh nhân',
    icon: Users,
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    key: 'totalPatients' as const
  }
] as const;

const quickActions = [
  {
    label: 'Xem lịch hẹn',
    action: 'appointments',
    icon: Calendar,
    color: 'bg-[#1E75FF] hover:bg-[#1659C9]'
  },
  {
    label: 'Tra cứu bệnh nhân',
    action: 'patients',
    icon: Users,
    color: 'bg-[#10B981] hover:bg-[#059669]'
  },
  {
    label: 'Bắt đầu tư vấn',
    action: 'consultation',
    icon: Video,
    color: 'bg-[#F59E0B] hover:bg-[#D97706]'
  }
] as const;

interface DoctorDashboardPageProps {
  onNavigate?: (tab: string) => void;
}

// @component: DoctorDashboardPage
export const DoctorDashboardPage = ({ onNavigate = () => {} }: DoctorDashboardPageProps) => {
  // Get authenticated user (contains doctorId as userId)
  const { data: user, isLoading: userLoading } = useGetMe();

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error,
    refetch
  } = useDoctorDashboard(user?.userId || '');

  // Combined loading state
  const isLoading = userLoading || dashboardLoading;

  // Function to format current date in Vietnamese
  const getCurrentDateString = () => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    return `Hôm nay là ${dayName}, ${day} tháng ${month}, ${year}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E75FF]" />
        <span className="ml-3 text-[#334155]">Đang tải dữ liệu dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">
                Không thể tải dữ liệu dashboard
              </h3>
              <p className="text-red-600 mt-1">
                {(error as any).response?.data?.message || 'Vui lòng thử lại sau'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!dashboardData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Không có dữ liệu dashboard</p>
        </div>
      </div>
    );
  }

  // Main dashboard UI
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div
        className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] rounded-2xl p-8 text-white shadow-[0_10px_24px_rgba(16,24,40,0.08)]"
        style={{
          background: 'linear-gradient(90deg, rgb(30, 117, 255) 0%, rgb(22, 89, 201) 100%)'
        }}
      >
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-3"
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start'
            }}
          >
            Chào mừng trở lại, Bác sĩ!
          </h1>
          <p
            className="text-white/90 text-lg"
            style={{
              textAlign: 'left',
              justifyContent: 'flex-start'
            }}
          >
            {getCurrentDateString()}
          </p>
        </div>
      </div>

      {/* Today's Overview - Statistics */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-[#1E75FF]" />
          <span>Tổng quan hôm nay</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayStats.map((stat, index) => {
            const Icon = stat.icon;
            const value = dashboardData.statistics[stat.key];

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: index * 0.1
                }}
                className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
                  <p className="text-sm text-[#334155]">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-6">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  delay: index * 0.1
                }}
                onClick={() => onNavigate(action.action)}
                className={`${action.color} text-white p-6 rounded-2xl flex items-center justify-between group transition-all duration-200 transform hover:scale-105`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={24} />
                  <span className="font-medium">{action.label}</span>
                </div>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
              <Clock size={24} className="text-[#1E75FF]" />
              <span>Lịch hẹn sắp tới</span>
            </h2>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-[#1E75FF] hover:text-[#1659C9] font-medium text-sm flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Empty state for appointments */}
          {dashboardData.upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Không có lịch hẹn nào hôm nay</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.upcomingAppointments.map((appointment, index) => {
                const statusConfig = APPOINTMENT_STATUS_CONFIG[appointment.status];

                return (
                  <motion.div
                    key={appointment.appointmentId}
                    initial={{
                      opacity: 0,
                      x: -20
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      delay: index * 0.1
                    }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#1E75FF]">{appointment.time}</p>
                      </div>
                      <div>
                        <p className="font-medium text-[#0F172A]">{appointment.patientName}</p>
                        <p className="text-sm text-[#334155]">{appointment.consultationType}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
              <Users size={24} className="text-[#1E75FF]" />
              <span>Bệnh nhân gần đây</span>
            </h2>
            <button
              onClick={() => onNavigate('patients')}
              className="text-[#1E75FF] hover:text-[#1659C9] font-medium text-sm flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Empty state for patients */}
          {dashboardData.recentPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Chưa có bệnh nhân nào gần đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentPatients.map((patient, index) => (
                <motion.div
                  key={patient.patientId}
                  initial={{
                    opacity: 0,
                    x: 20
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  transition={{
                    delay: index * 0.1
                  }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onNavigate('patients')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1E75FF] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {patient.patientName.split(' ').pop()?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A]">{patient.patientName}</p>
                      <p className="text-sm text-[#334155]">{patient.diagnosis}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#334155]">{patient.timeAgo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

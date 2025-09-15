import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Video, Clock, ArrowRight, TrendingUp, CheckCircle, UserPlus, Bell } from 'lucide-react';
const todayStats = [{
  label: 'Lịch hẹn hôm nay',
  value: '8',
  icon: Calendar,
  color: 'text-[#1E75FF]',
  bg: 'bg-[#1E75FF]/10'
}, {
  label: 'Bệnh nhân mới',
  value: '3',
  icon: UserPlus,
  color: 'text-[#10B981]',
  bg: 'bg-[#10B981]/10'
}, {
  label: 'Tư vấn hoàn thành',
  value: '12',
  icon: CheckCircle,
  color: 'text-[#F59E0B]',
  bg: 'bg-[#F59E0B]/10'
}, {
  label: 'Tổng bệnh nhân',
  value: '247',
  icon: Users,
  color: 'text-[#EF4444]',
  bg: 'bg-[#EF4444]/10'
}] as any[];
const quickActions = [{
  label: 'Xem lịch hẹn',
  action: 'appointments',
  icon: Calendar,
  color: 'bg-[#1E75FF] hover:bg-[#1659C9]'
}, {
  label: 'Tra cứu bệnh nhân',
  action: 'patients',
  icon: Users,
  color: 'bg-[#10B981] hover:bg-[#059669]'
}, {
  label: 'Bắt đầu tư vấn',
  action: 'consultation',
  icon: Video,
  color: 'bg-[#F59E0B] hover:bg-[#D97706]'
}] as any[];
const upcomingAppointments = [{
  time: '09:00',
  patient: 'Nguyễn Văn An',
  service: 'Tư vấn CKD giai đoạn 3',
  status: 'confirmed'
}, {
  time: '10:30',
  patient: 'Trần Thị Bình',
  service: 'Theo dõi định kỳ',
  status: 'pending'
}, {
  time: '14:00',
  patient: 'Lê Minh Cường',
  service: 'Tư vấn điều trị',
  status: 'confirmed'
}] as any[];
const recentPatients = [{
  name: 'Phạm Thị Dung',
  lastVisit: '2 giờ trước',
  eGFR: '45 ml/min',
  status: 'stable'
}, {
  name: 'Hoàng Văn Em',
  lastVisit: '1 ngày trước',
  eGFR: '32 ml/min',
  status: 'declining'
}, {
  name: 'Vũ Thị Phương',
  lastVisit: '3 ngày trước',
  eGFR: '58 ml/min',
  status: 'improving'
}] as any[];
interface DoctorDashboardPageProps {
  onNavigate: (tab: string) => void;
}

// @component: DoctorDashboardPage
export const DoctorDashboardPage = ({
  onNavigate
}: DoctorDashboardPageProps) => {
  // @return
  return <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner - Updated to match Patient/Admin style */}
      <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] rounded-2xl p-8 text-white shadow-[0_10px_24px_rgba(16,24,40,0.08)]" style={{
      background: "linear-gradient(90deg, rgb(30, 117, 255) 0%, rgb(22, 89, 201) 100%)"
    }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3" style={{
          textAlign: "left",
          justifyContent: "flex-start"
        }}>Chào mừng trở lại, Bác sĩ!</h1>
          <p className="text-white/90 text-lg" style={{
          textAlign: "left",
          justifyContent: "flex-start"
        }}>Hôm nay là Thứ Tư, 20 tháng 8, 2025</p>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-[#1E75FF]" />
          <span>Tổng quan hôm nay</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return <motion.div key={stat.label} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                  <p className="text-sm text-[#334155]">{stat.label}</p>
                </div>
              </motion.div>;
        })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
        <h2 className="text-xl font-semibold text-[#0F172A] mb-6">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
          const Icon = action.icon;
          return <motion.button key={action.label} initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: index * 0.1
          }} onClick={() => onNavigate(action.action)} className={`${action.color} text-white p-6 rounded-2xl flex items-center justify-between group transition-all duration-200 transform hover:scale-105`}>
                <div className="flex items-center gap-3">
                  <Icon size={24} />
                  <span className="font-medium">{action.label}</span>
                </div>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>;
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
            <button onClick={() => onNavigate('appointments')} className="text-[#1E75FF] hover:text-[#1659C9] font-medium text-sm flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.1
          }} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#1E75FF]">{appointment.time}</p>
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A]">{appointment.patient}</p>
                    <p className="text-sm text-[#334155]">{appointment.service}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.status === 'confirmed' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                  {appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                </span>
              </motion.div>)}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
              <Users size={24} className="text-[#1E75FF]" />
              <span>Bệnh nhân gần đây</span>
            </h2>
            <button onClick={() => onNavigate('patients')} className="text-[#1E75FF] hover:text-[#1659C9] font-medium text-sm flex items-center gap-1">
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentPatients.map((patient, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.1
          }} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => onNavigate('patients')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1E75FF] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {patient.name.split(' ').pop()?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A]">{patient.name}</p>
                    <p className="text-sm text-[#334155]">eGFR: {patient.eGFR}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#334155]">{patient.lastVisit}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'stable' ? 'bg-[#10B981]/10 text-[#10B981]' : patient.status === 'improving' ? 'bg-[#1E75FF]/10 text-[#1E75FF]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                    {patient.status === 'stable' ? 'Ổn định' : patient.status === 'improving' ? 'Cải thiện' : 'Giảm'}
                  </span>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>

      {/* System Notifications */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6" style={{
      display: "none"
    }}>
        <h2 className="text-xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
          <Bell size={24} className="text-[#1E75FF]" />
          <span>Thông báo hệ thống</span>
        </h2>
        <div className="bg-[#1E75FF]/5 border border-[#1E75FF]/20 rounded-xl p-4">
          <p className="text-[#334155]">
            <strong className="text-[#0F172A]">Cập nhật hệ thống:</strong> Tính năng AI hỗ trợ chẩn đoán CKD đã được cập nhật với độ chính xác cao hơn.
          </p>
        </div>
      </div>
    </div>;
};
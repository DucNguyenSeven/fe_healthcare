import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  MessageCircle,
  FileText,
  Clock,
  Video,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Activity,
  Heart,
  Droplets,
  Weight,
  MapPin,
  Phone
} from 'lucide-react';
import type { HealthMetricLatest } from '@/types/dashboard';
import type { TodayAppointment, PrescriptionGroup } from '@/types/dashboard';
import type { MedicalRecordWithPrescriptions } from '@/types/medical-record';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PrescriptionGroupModal } from './PrescriptionGroupModal';

interface DashboardPageProps {
  user: {
    name?: string;
    fullName?: string;
    email: string;
  };
  healthMetrics: HealthMetricLatest[];
  todayAppointments: TodayAppointment[];
  recentConsultations: MedicalRecordWithPrescriptions[];
  prescriptionGroups: PrescriptionGroup[];
  onNavigate?: (page: string) => void;
  isLoading?: boolean;
}

export function DashboardPage({
  user,
  healthMetrics,
  todayAppointments,
  recentConsultations,
  prescriptionGroups,
  onNavigate = () => {},
  isLoading = false
}: DashboardPageProps) {
  const [selectedPrescriptionGroup, setSelectedPrescriptionGroup] = useState<PrescriptionGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPrescriptionModal = (group: PrescriptionGroup) => {
    setSelectedPrescriptionGroup(group);
    setIsModalOpen(true);
  };

  const closePrescriptionModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPrescriptionGroup(null), 300); // Delay to allow modal animation
  };

  const quickActions = [
    {
      id: 'input-metrics',
      label: 'Nhập chỉ số',
      icon: Plus,
      color: 'bg-blue-500',
      onClick: () => onNavigate('monitoring')
    },
    {
      id: 'book-appointment',
      label: 'Đặt lịch',
      icon: Calendar,
      color: 'bg-green-500',
      onClick: () => onNavigate('appointments')
    },
    {
      id: 'ai-chat',
      label: 'Tư vấn với AI',
      icon: MessageCircle,
      color: 'bg-purple-500',
      onClick: () => onNavigate('ai-assistant')
    },
    {
      id: 'view-results',
      label: 'Xem kết quả',
      icon: FileText,
      color: 'bg-orange-500',
      onClick: () => onNavigate('telehealth')
    }
  ];

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'eGFR':
        return Activity;
      case 'Creatinine':
        return Droplets;
      case 'Blood Pressure':
        return Heart;
      case 'Weight':
        return Weight;
      default:
        return Activity;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'ONLINE':
      case 'ONLINE_CONSULTATION':
        return 'Tư vấn online';
      case 'OFFLINE':
      case 'DIRECT_CONSULTATION':
        return 'Khám trực tiếp';
      case 'PHONE':
      case 'PHONE_CONSULTATION':
        return 'Tư vấn điện thoại';
      case 'FOLLOW_UP':
        return 'Tái khám';
      default:
        return type;
    }
  };

  // Helper function to get icon for consultation type
  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'ONLINE':
      case 'ONLINE_CONSULTATION':
        return Video;
      case 'OFFLINE':
      case 'DIRECT_CONSULTATION':
        return MapPin;
      case 'PHONE':
      case 'PHONE_CONSULTATION':
        return Phone;
      case 'FOLLOW_UP':
        return Calendar;
      default:
        return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Có thể vào</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Chờ xác nhận</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">Đã hoàn thành</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Đã hủy</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <div
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white"
        style={{
          background: 'linear-gradient(90deg, oklch(0.546 0.245 262.881) 0%, oklch(0.488 0.243 264.376) 100%)'
        }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Chào mừng trở lại, {user.name || user.fullName || 'Bạn'}!
        </h1>
        <p className="text-blue-100 mb-4">Hôm nay là ngày tốt để chăm sóc sức khỏe của bạn</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Metrics Card - ƯU TIÊN CHỈ SỐ SUY THẬN */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Chỉ số sức khỏe</h2>
              <button
                onClick={() => onNavigate('monitoring')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {healthMetrics.length > 0 ? (
                healthMetrics.map(metric => {
                  const Icon = getMetricIcon(metric.metricName);
                  return (
                    <div key={metric.metricId} className={`p-4 rounded-xl ${metric.alert.bgColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${metric.alert.iconColor}`} />
                        {metric.alert.level !== 'NORMAL' && (
                          <AlertTriangle className={`w-4 h-4 ${metric.alert.iconColor}`} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{metric.displayName}</p>
                      <p className={`text-lg font-semibold ${metric.alert.textColor}`}>
                        {metric.metricValue} {metric.unit}
                      </p>
                      {/* Chú thích màu sắc */}
                      <div className="mt-2">
                        <span className={`text-xs font-medium ${metric.alert.textColor}`}>
                          {metric.alert.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu chỉ số sức khỏe</p>
                  <button
                    onClick={() => onNavigate('monitoring')}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Nhập chỉ số ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tư vấn gần đây</h2>
            <div className="space-y-3">
              {recentConsultations.length > 0 ? (
                recentConsultations.map(record => {
                  // Suy luận icon từ serviceName vì MedicalRecord không có consultationType
                  const getIconForService = (serviceName?: string) => {
                    if (!serviceName) return FileText;
                    const lowerService = serviceName.toLowerCase();
                    if (lowerService.includes('online') || lowerService.includes('trực tuyến')) {
                      return Video;
                    } else if (lowerService.includes('trực tiếp') || lowerService.includes('khám')) {
                      return MapPin;
                    } else if (lowerService.includes('điện thoại') || lowerService.includes('phone')) {
                      return Phone;
                    }
                    return FileText;
                  };

                  const ServiceIcon = getIconForService(record.serviceName);

                  return (
                    <div key={record.recordId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <ServiceIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{record.doctorName}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {record.serviceName} - {format(new Date(record.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap">
                        Xem lại
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Chưa có tư vấn nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hôm nay</h2>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map(appointment => (
                  <div key={appointment.appointmentId} className="p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        {appointment.timeSlot.startTime}
                      </span>
                      {appointment.status === 'CONFIRMED' &&
                       appointment.consultationType === 'ONLINE' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Có thể vào
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{getConsultationTypeLabel(appointment.consultationType)}</p>
                    <p className="text-sm text-gray-600">{appointment.doctor.fullName}</p>
                    <div className="mt-2">{getStatusBadge(appointment.status)}</div>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('appointments')}
                  className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
                >
                  Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Không có lịch hẹn hôm nay</p>
                <button
                  onClick={() => onNavigate('appointments')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Đặt lịch mới
                </button>
              </div>
            )}
          </div>

          {/* Prescription Groups - CÁC TOA THUỐC */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Các toa thuốc</h2>
            <div className="space-y-3">
              {prescriptionGroups.length > 0 ? (
                prescriptionGroups.slice(0, 3).map(group => (
                  <div key={group.medicalRecordId} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{group.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          {group.doctorName} • {format(new Date(group.createdDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      {group.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium whitespace-nowrap">
                          Đang dùng
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium whitespace-nowrap">
                          Đã dùng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{group.totalMedicines} loại thuốc</p>

                    {/* View Details Button */}
                    <button
                      onClick={() => openPrescriptionModal(group)}
                      className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Chưa có toa thuốc nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Group Modal */}
      <PrescriptionGroupModal
        isOpen={isModalOpen}
        onClose={closePrescriptionModal}
        prescriptionGroup={selectedPrescriptionGroup}
      />
    </div>
  );
}

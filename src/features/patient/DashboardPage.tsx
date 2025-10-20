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
  Phone,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle
} from 'lucide-react';
import type { HealthMetricLatest, HealthMetricWithComparison } from '@/types/dashboard';
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
  healthMetrics: (HealthMetricLatest | HealthMetricWithComparison)[];
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
    const normalized = metricName.toLowerCase();

    if (normalized.includes('egfr') || normalized === 'gfr') {
      return Activity;
    }
    if (normalized.includes('creatinine')) {
      return Droplets;
    }
    if (normalized.includes('blood pressure') || normalized.includes('huyết áp')) {
      return Heart;
    }
    if (normalized.includes('weight') || normalized.includes('cân nặng')) {
      return Weight;
    }
    if (normalized.includes('bun') || normalized.includes('ure')) {
      return Droplets; // Cùng icon với Creatinine vì cùng liên quan đến thận
    }
    if (normalized.includes('canxi') || normalized.includes('calcium')) {
      return Activity; // Có thể thay bằng icon khác nếu cần
    }

    return Activity; // Default
  };

  // Helper: Lấy mô tả ngắn cho từng chỉ số
  const getMetricDescription = (metricName: string): string => {
    const normalized = metricName.toLowerCase();

    if (normalized.includes('egfr') || normalized === 'gfr') {
      return 'Chức năng thận';
    }
    if (normalized.includes('creatinine')) {
      return 'Chỉ số thận';
    }
    if (normalized.includes('bun') || normalized.includes('ure')) {
      return 'Nitơ ure máu';
    }
    if (normalized.includes('canxi') || normalized.includes('calcium')) {
      return 'Canxi máu';
    }
    return '';
  };

  // Helper: Border color theo mức cảnh báo
  const getBorderColor = (level: string): string => {
    switch (level) {
      case 'NORMAL':
        return 'border-green-400';
      case 'WARNING':
        return 'border-yellow-400';
      case 'DANGER':
        return 'border-orange-400';
      case 'CRITICAL':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  // Helper: Badge style theo mức cảnh báo
  const getBadgeStyle = (level: string): string => {
    switch (level) {
      case 'NORMAL':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DANGER':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper: Icon cho từng mức cảnh báo
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'NORMAL':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'DANGER':
        return '🔴';
      case 'CRITICAL':
        return '🆘';
      default:
        return '';
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
                  const metricWithComparison = metric as HealthMetricWithComparison;
                  const hasComparison = 'previousMonthValue' in metricWithComparison &&
                                       metricWithComparison.previousMonthValue !== undefined;

                  return (
                    <div
                      key={metric.metricId}
                      className={`
                        p-3.5 rounded-xl bg-white
                        ${metric.alert.level === 'NORMAL' ? 'border-2' : 'border-4'}
                        ${getBorderColor(metric.alert.level)}
                        transition-all hover:shadow-md
                      `}
                    >
                      {/* Header: Icon + Tên + Giải thích */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-1.5 flex-1">
                          <Icon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-xs leading-tight">{metric.displayName}</h3>
                            {getMetricDescription(metric.metricName) && (
                              <p className="text-[11px] text-gray-500 mt-0.5">{getMetricDescription(metric.metricName)}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Body: Số TO + Badge cảnh báo */}
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-2xl font-bold text-gray-900 leading-none">{metric.metricValue}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{metric.unit}</p>
                        </div>
                        <span className={`
                          px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap
                          ${metric.alert.level === 'NORMAL' ? 'text-[10px]' : 'text-xs font-bold'}
                          ${getBadgeStyle(metric.alert.level)}
                        `}>
                          {getAlertIcon(metric.alert.level)}{' '}
                          {metric.alert.level === 'NORMAL'
                            ? metric.alert.label
                            : metric.alert.label.toUpperCase()
                          }
                        </span>
                      </div>

                      {/* So sánh với mức bình thường */}
                      {metricWithComparison.exceedanceStatus && (
                        <div className={`
                          mb-2 p-2.5 rounded-lg
                          ${metricWithComparison.exceedanceStatus === 'normal'
                            ? 'bg-green-50 border border-green-200'
                            : metricWithComparison.alert.level === 'CRITICAL'
                              ? 'bg-red-50 border border-red-200'
                              : metricWithComparison.alert.level === 'DANGER'
                                ? 'bg-orange-50 border border-orange-200'
                                : 'bg-yellow-50 border border-yellow-200'
                          }
                        `}>
                          <div className="flex items-start gap-1.5">
                            {/* Icon */}
                            <span className="text-base flex-shrink-0">
                              {metricWithComparison.exceedanceStatus === 'normal' ? '✅' :
                               metricWithComparison.alert.level === 'CRITICAL' ? '🆘' : '⚠️'}
                            </span>

                            {/* Nội dung */}
                            <div className="flex-1 min-w-0">
                              <p className={`
                                text-xs leading-tight
                                ${metricWithComparison.exceedanceStatus === 'normal'
                                  ? 'text-green-700 font-medium'
                                  : metricWithComparison.alert.level === 'CRITICAL'
                                    ? 'text-red-700 font-bold'
                                    : metricWithComparison.alert.level === 'DANGER'
                                      ? 'text-orange-700 font-bold'
                                      : 'text-yellow-700 font-semibold'
                                }
                              `}>
                                {metricWithComparison.exceedanceMessage}
                              </p>
                              <p className="text-[10px] text-gray-600 mt-0.5">
                                (Bình thường: {metricWithComparison.normalRange?.description})
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Đường kẻ phân cách - CHỈ hiển thị khi CÓ so sánh tháng trước */}
                      {hasComparison && metricWithComparison.previousMonthValue && (
                        <div className="border-t border-gray-200 my-2"></div>
                      )}

                      {/* So sánh với tháng trước */}
                      {hasComparison && metricWithComparison.previousMonthValue && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {metricWithComparison.changeDirection === 'up' ? (
                              <ArrowUp className={`w-3.5 h-3.5 flex-shrink-0 ${metricWithComparison.isTrendGood ? 'text-green-600' : 'text-red-600'}`} />
                            ) : metricWithComparison.changeDirection === 'down' ? (
                              <ArrowDown className={`w-3.5 h-3.5 flex-shrink-0 ${metricWithComparison.isTrendGood ? 'text-green-600' : 'text-red-600'}`} />
                            ) : (
                              <Minus className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={`text-xs font-medium ${metricWithComparison.isTrendGood ? 'text-green-700' : metricWithComparison.changeDirection === 'stable' ? 'text-gray-600' : 'text-red-700'}`}>
                              {metricWithComparison.changeDirection === 'up' ? 'Tăng' : metricWithComparison.changeDirection === 'down' ? 'Giảm' : 'Ổn định'}
                              {metricWithComparison.changePercentage !== undefined && metricWithComparison.changeDirection !== 'stable' &&
                                ` ${Math.abs(metricWithComparison.changePercentage).toFixed(1)}%`
                              } so với tháng trước
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500">
                            {metricWithComparison.previousMonthDate &&
                              `Tháng ${format(new Date(metricWithComparison.previousMonthDate), 'M', { locale: vi })}: `
                            }
                            {metricWithComparison.previousMonthValue} {metric.unit}
                          </p>
                        </div>
                      )}
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

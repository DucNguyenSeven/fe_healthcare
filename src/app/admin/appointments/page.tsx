'use client'

import { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Video, Building2, PieChart, AlertCircle, RefreshCw, DollarSign, Hourglass } from 'lucide-react';
import { useAppointmentStatistics, useStatsByConsultationType } from '@/hooks/admin/useAppointmentsData';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Helper to format numbers
const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export default function AppointmentsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  });

  // Fetch data from API
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAppointmentStatistics(dateRange);
  const { data: statsByType, isLoading: typeLoading } = useStatsByConsultationType(dateRange);

  // Combined error state
  if (statsError) {
    const error = statsError;
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Không thể tải dữ liệu lịch hẹn</h3>
              <p className="text-red-700 text-sm mb-4">
                {(error as any)?.response?.data?.message || (error as any)?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
              </p>
              <button
                onClick={() => refetchStats()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (statsLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        {/* Skeleton for date range */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        {/* Skeleton for statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Khoảng thời gian:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Statistics Cards - 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Tổng lịch hẹn', value: formatNumber(stats?.totalAppointments), icon: Calendar, color: 'bg-purple-500' },
          { title: 'Đã hoàn thành', value: formatNumber(stats?.appointmentsByStatus?.COMPLETED), icon: CheckCircle, color: 'bg-green-500' },
          { title: 'Đã xác nhận', value: formatNumber(stats?.appointmentsByStatus?.CONFIRMED), icon: Clock, color: 'bg-blue-500' },
          { title: 'Đã hủy', value: formatNumber(stats?.appointmentsByStatus?.CANCELED), icon: XCircle, color: 'bg-red-500' },
          { title: 'Chờ thanh toán', value: formatNumber(stats?.appointmentsByStatus?.PAYMENT_PENDING), icon: DollarSign, color: 'bg-orange-500' },
          { title: 'Chờ xác nhận', value: formatNumber(stats?.appointmentsByStatus?.PENDING), icon: Hourglass, color: 'bg-yellow-500' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hẹn theo trạng thái</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Đã hoàn thành', value: stats?.appointmentsByStatus?.COMPLETED || 0, fill: '#10b981' },
                    { name: 'Đã xác nhận', value: stats?.appointmentsByStatus?.CONFIRMED || 0, fill: '#3b82f6' },
                    { name: 'Đã hủy', value: stats?.appointmentsByStatus?.CANCELED || 0, fill: '#ef4444' },
                    { name: 'Chờ thanh toán', value: stats?.appointmentsByStatus?.PAYMENT_PENDING || 0, fill: '#f97316' },
                    { name: 'Chờ xác nhận', value: stats?.appointmentsByStatus?.PENDING || 0, fill: '#eab308' }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {[
                    { name: 'Đã hoàn thành', value: stats?.appointmentsByStatus?.COMPLETED || 0, fill: '#10b981' },
                    { name: 'Đã xác nhận', value: stats?.appointmentsByStatus?.CONFIRMED || 0, fill: '#3b82f6' },
                    { name: 'Đã hủy', value: stats?.appointmentsByStatus?.CANCELED || 0, fill: '#ef4444' },
                    { name: 'Chờ thanh toán', value: stats?.appointmentsByStatus?.PAYMENT_PENDING || 0, fill: '#f97316' },
                    { name: 'Chờ xác nhận', value: stats?.appointmentsByStatus?.PENDING || 0, fill: '#eab308' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments by Consultation Type */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hẹn theo loại tư vấn</h2>
          <div className="h-80">
            {typeLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : statsByType && statsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statsByType.map(type => ({
                      name: type.consultationType === 'VIDEO_CALL' ? 'Tư vấn video' : 'Khám trực tiếp',
                      value: type.totalCount,
                      fill: type.consultationType === 'VIDEO_CALL' ? '#3b82f6' : '#a855f7'
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {statsByType.map((type, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={type.consultationType === 'VIDEO_CALL' ? '#3b82f6' : '#a855f7'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Không có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Type Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết theo loại tư vấn</h2>
        {typeLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : statsByType && statsByType.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsByType.map((type, idx) => {
              const Icon = type.consultationType === 'VIDEO_CALL' ? Video : Building2;
              const iconBgColor = type.consultationType === 'VIDEO_CALL' ? 'bg-blue-100' : 'bg-purple-100';
              const iconColor = type.consultationType === 'VIDEO_CALL' ? 'text-blue-600' : 'text-purple-600';
              const percentage = stats?.totalAppointments
                ? ((type.totalCount / stats.totalAppointments) * 100).toFixed(1)
                : '0';

              return (
                <div key={idx} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {type.consultationType === 'VIDEO_CALL' ? 'Tư vấn video' : 'Khám trực tiếp'}
                        </h3>
                        <p className="text-sm text-gray-600">{type.consultationType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng số:</span>
                      <span className="font-semibold">{formatNumber(type.totalCount)} lịch</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hoàn thành:</span>
                      <span className="font-semibold text-green-600">{formatNumber(type.completedCount)} lịch</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tỷ lệ:</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Không có dữ liệu</p>
          </div>
        )}
      </div>

      {/* Completed Appointments by Doctor */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hẹn hoàn thành theo bác sĩ</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Bảng lịch hẹn theo bác sĩ</p>
          <p className="text-sm text-gray-500 mt-2">
            Columns: Bác sĩ | Chuyên khoa | Số lịch hoàn thành | Tỷ lệ hoàn thành | Đánh giá TB
          </p>
        </div>
      </div>

      {/* Appointment Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Xu hướng lịch hẹn theo thời gian</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Biểu đồ đường thời gian</p>
          <p className="text-sm text-gray-500 mt-2">
            Line chart hiển thị số lượng lịch hẹn theo ngày/tuần/tháng
          </p>
        </div>
      </div>
    </div>
  );
}

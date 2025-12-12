'use client'

import React from 'react';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RefreshCw,
  Star
} from 'lucide-react';
import { useDashboardOverview } from '@/hooks/admin/useDashboard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AdminDashboardPageProps {
  onNavigate?: (page: string) => void;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Helper function to format number with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export function AdminDashboardPage({
  onNavigate = () => { },
}: AdminDashboardPageProps) {
  // Fetch dashboard data from API
  const { data, isLoading, error, refetch } = useDashboardOverview();

  // Error state
  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Không thể tải dữ liệu dashboard</h3>
              <p className="text-red-700 text-sm mb-4">
                {(error as any)?.response?.data?.message || (error as any)?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
              </p>
              <button
                onClick={() => refetch()}
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
  if (isLoading || !data) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
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
        {/* Skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Transform API data to UI format
  const { statistics } = data;

  const statsCards = [
    {
      title: 'Tổng doanh thu tháng này',
      value: formatCurrency(statistics.totalRevenueThisMonth),
      change: `+${statistics.growthRate}%`,
      trend: 'up' as const,
      icon: DollarSign,
      iconColor: 'bg-blue-500'
    },
    {
      title: 'Lịch hẹn tháng này',
      value: formatNumber(statistics.totalAppointmentsThisMonth),
      change: '+8.2%',
      trend: 'up' as const,
      icon: Calendar,
      iconColor: 'bg-green-500'
    },
    {
      title: 'Người dùng hoạt động',
      value: formatNumber(statistics.totalActiveUsers),
      change: '+5.1%',
      trend: 'up' as const,
      icon: Users,
      iconColor: 'bg-purple-500'
    },
    {
      title: 'Tỷ lệ tăng trưởng',
      value: `${statistics.growthRate}%`,
      change: '+2.3%',
      trend: 'up' as const,
      icon: TrendingUp,
      iconColor: 'bg-orange-500'
    }
  ];

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
          Admin Dashboard
        </h1>
        <p className="text-blue-100 mb-4">Quản lý hệ thống HealthCare+ toàn diện</p>
      </div>

      {/* Statistics Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tổng quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6
                           hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.iconColor} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center text-sm">
                    {stat.trend === 'up' ? (
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Biểu đồ doanh thu</h2>
              <button
                onClick={() => onNavigate('revenue')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Revenue Trend Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Doanh thu"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Doctors (1/3 width) */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 5 Bác sĩ</h2>
            <div className="space-y-3">
              {data.charts.topDoctors.map((doctor, index) => (
                <div key={doctor.doctorId} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full
                                  flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">{doctor.doctorName}</p>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">{doctor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{doctor.appointmentCount} lịch hẹn</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(doctor.totalRevenue)}
                      </span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Appointments & Revenue by Service Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hẹn theo trạng thái</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { status: 'Đã xác nhận', value: data.charts.appointmentsByStatus.CONFIRMED || 0, fill: '#3b82f6' },
                  { status: 'Đã hoàn thành', value: data.charts.appointmentsByStatus.COMPLETED || 0, fill: '#10b981' },
                  { status: 'Đã hủy', value: data.charts.appointmentsByStatus.CANCELLED || 0, fill: '#ef4444' },
                  { status: 'Chờ thanh toán', value: data.charts.appointmentsByStatus.PAYMENT_PENDING || 0, fill: '#f59e0b' }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="value" name="Số lượng" radius={[8, 8, 0, 0]}>
                  {[
                    { status: 'Đã xác nhận', value: data.charts.appointmentsByStatus.CONFIRMED || 0, fill: '#3b82f6' },
                    { status: 'Đã hoàn thành', value: data.charts.appointmentsByStatus.COMPLETED || 0, fill: '#10b981' },
                    { status: 'Đã hủy', value: data.charts.appointmentsByStatus.CANCELLED || 0, fill: '#ef4444' },
                    { status: 'Chờ thanh toán', value: data.charts.appointmentsByStatus.PAYMENT_PENDING || 0, fill: '#f59e0b' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Service Type */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Doanh thu theo loại dịch vụ</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Video Call', value: data.charts.revenueByServiceType.VIDEO_CALL, fill: '#3b82f6' },
                    { name: 'Trực tiếp', value: data.charts.revenueByServiceType.IN_PERSON, fill: '#10b981' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {[
                    { name: 'Video Call', value: data.charts.revenueByServiceType.VIDEO_CALL, fill: '#3b82f6' },
                    { name: 'Trực tiếp', value: data.charts.revenueByServiceType.IN_PERSON, fill: '#10b981' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
        <div className="space-y-3">
          {/* Activity items placeholder */}
          <p className="text-gray-500 text-center py-8">Danh sách hoạt động gần đây</p>
        </div>
      </div>
    </div>
  );
}

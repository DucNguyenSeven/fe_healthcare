'use client'

import React from 'react';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import type { DashboardResponse } from '@/types/admin';

interface AdminDashboardPageProps {
  onNavigate?: (page: string) => void;
  isLoading?: boolean;
}

// Mock data - CHÍNH XÁC với API response structure
// Endpoint: GET /api/v1/admin/dashboard
const mockDashboardData: DashboardResponse = {
  statistics: {
    totalRevenueThisMonth: 150000000,      // 150 triệu
    totalAppointmentsThisMonth: 245,
    totalActiveUsers: 1250,
    growthRate: 12.5,
  },
  charts: {
    revenueTrend: [
      { date: '2025-12-01', revenue: 5000000 },
      { date: '2025-12-02', revenue: 5500000 },
      { date: '2025-12-03', revenue: 4800000 },
      { date: '2025-12-04', revenue: 6200000 },
      { date: '2025-12-05', revenue: 5900000 },
      { date: '2025-12-06', revenue: 6500000 },
      { date: '2025-12-07', revenue: 7200000 },
    ],
    appointmentsByStatus: {
      COMPLETED: 180,
      CONFIRMED: 45,
      CANCELLED: 20,
    },
    topDoctors: [
      {
        doctorId: 'DOC001',
        doctorName: 'Dr. Nguyễn Văn A',
        specialty: 'Nội khoa',
        totalRevenue: 25000000,
        appointmentCount: 45,
        rating: 4.8,
      },
      {
        doctorId: 'DOC002',
        doctorName: 'Dr. Trần Thị B',
        specialty: 'Tim mạch',
        totalRevenue: 22000000,
        appointmentCount: 38,
        rating: 4.9,
      },
      {
        doctorId: 'DOC003',
        doctorName: 'Dr. Lê Văn C',
        specialty: 'Ngoại khoa',
        totalRevenue: 20000000,
        appointmentCount: 35,
        rating: 4.7,
      },
      {
        doctorId: 'DOC004',
        doctorName: 'Dr. Phạm Thị D',
        specialty: 'Sản phụ khoa',
        totalRevenue: 18000000,
        appointmentCount: 32,
        rating: 4.6,
      },
      {
        doctorId: 'DOC005',
        doctorName: 'Dr. Hoàng Văn E',
        specialty: 'Nhi khoa',
        totalRevenue: 17000000,
        appointmentCount: 30,
        rating: 4.8,
      },
    ],
    revenueByServiceType: {
      VIDEO_CALL: 80000000,
      IN_PERSON: 70000000,
    },
  },
  recentActivities: {
    recentUsers: [],
    recentAppointments: [],
    recentPayments: [],
  },
};

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
  onNavigate = () => {},
  isLoading = false
}: AdminDashboardPageProps) {

  // Transform API data to UI format
  const { statistics } = mockDashboardData;

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

            {/* Chart placeholder - sẽ thay bằng Recharts */}
            <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Revenue Trend Chart (30 ngày)</p>
            </div>
          </div>
        </div>

        {/* Top Doctors (1/3 width) */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top 5 Bác sĩ</h2>
            <div className="space-y-3">
              {mockDashboardData.charts.topDoctors.map((doctor, index) => (
                <div key={doctor.doctorId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full
                                  flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{doctor.doctorName}</p>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {(doctor.totalRevenue / 1000000).toFixed(0)}M đ
                    </p>
                    <p className="text-xs text-gray-500">{doctor.appointmentCount} lịch</p>
                  </div>
                </div>
              ))}
            </div>
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

'use client'

import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Users, BarChart3, PieChart, AlertCircle, RefreshCw } from 'lucide-react';
import { useRevenueOverview, useRevenueBySpecialty, useRevenueByServiceType } from '@/hooks/admin/useRevenueData';

// Helper to format numbers
const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

// Helper to format currency
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  });

  // Fetch data from API
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useRevenueOverview(dateRange);
  const { data: bySpecialty, isLoading: specialtyLoading } = useRevenueBySpecialty(dateRange);
  const { data: byServiceType, isLoading: serviceTypeLoading } = useRevenueByServiceType(dateRange);

  // Combined error state
  if (overviewError) {
    const error = overviewError;
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Không thể tải dữ liệu doanh thu</h3>
              <p className="text-red-700 text-sm mb-4">
                {(error as any)?.response?.data?.message || (error as any)?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
              </p>
              <button
                onClick={() => refetchOverview()}
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
  if (overviewLoading) {
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
        {/* Skeleton for charts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded" />
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Statistics Cards - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng doanh thu', value: formatCurrency(overview?.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
          { title: 'Tổng lịch hẹn', value: formatNumber(overview?.totalAppointments), icon: Calendar, color: 'bg-blue-500' },
          { title: 'Trung bình/lịch hẹn', value: formatCurrency(overview?.averagePaymentAmount), icon: TrendingUp, color: 'bg-purple-500' },
          { title: 'Lịch hoàn thành', value: formatNumber(overview?.completedAppointments), icon: Users, color: 'bg-orange-500' },
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

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Biểu đồ doanh thu theo thời gian</h2>
            <p className="text-sm text-gray-600 mt-1">Doanh thu hàng ngày trong khoảng thời gian đã chọn</p>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>90 ngày qua</option>
            <option>Tùy chỉnh</option>
          </select>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Biểu đồ cột doanh thu theo ngày</p>
          <p className="text-sm text-gray-500 mt-2">Line chart hoặc Bar chart hiển thị revenue theo date</p>
        </div>
      </div>

      {/* Revenue by Doctor and Specialty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Doctor */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Doanh thu theo bác sĩ</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Bảng doanh thu bác sĩ</p>
            <p className="text-sm text-gray-500 mt-2">
              Columns: Bác sĩ | Chuyên khoa | Tổng doanh thu | Số lịch hẹn
            </p>
          </div>
        </div>

        {/* Revenue by Specialty */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Doanh thu theo chuyên khoa</h2>
          {specialtyLoading ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center animate-pulse">
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          ) : bySpecialty && bySpecialty.length > 0 ? (
            <div className="space-y-3">
              {bySpecialty.map((specialty, idx) => {
                const percentage = overview?.totalRevenue
                  ? ((specialty.totalRevenue / overview.totalRevenue) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{specialty.specialty}</p>
                      <p className="text-sm text-gray-500">{percentage}% tổng doanh thu</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(specialty.totalRevenue)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <PieChart className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Không có dữ liệu chuyên khoa</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Service Type */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Doanh thu theo loại dịch vụ</h2>
        {serviceTypeLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-8 text-center animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
              <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
            </div>
            <div className="border border-gray-200 rounded-lg p-8 text-center animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
              <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
            </div>
          </div>
        ) : byServiceType && byServiceType.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {byServiceType.map((service, idx) => {
              const percentage = overview?.totalRevenue
                ? ((service.totalRevenue / overview.totalRevenue) * 100).toFixed(1)
                : '0';
              return (
                <div key={idx} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <p className="text-gray-600 font-medium">{service.consultationType}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(service.totalRevenue)}</p>
                  <p className="text-sm text-gray-500 mt-1">{percentage}% tổng doanh thu</p>
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

      {/* Top Performers */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top bác sĩ hiệu suất cao</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Danh sách top 10 bác sĩ</p>
          <p className="text-sm text-gray-500 mt-2">
            Xếp hạng theo: Doanh thu | Số lịch hẹn | Đánh giá | Tỷ lệ hoàn thành
          </p>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, CheckCircle, BarChart3, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { usePaymentStatistics } from '@/hooks/admin/usePaymentsData';

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

export default function PaymentsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  });

  // Fetch data from API
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = usePaymentStatistics(dateRange);

  // Combined error state
  if (statsError) {
    const error = statsError;
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Không thể tải dữ liệu thanh toán</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Statistics Cards - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Tổng doanh thu', value: formatCurrency(stats?.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
          { title: 'Số giao dịch', value: formatNumber(stats?.paymentCount), icon: Receipt, color: 'bg-blue-500' },
          { title: 'Giá trị trung bình', value: formatCurrency(stats?.averagePaymentAmount), icon: TrendingUp, color: 'bg-purple-500' },
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

      {/* Revenue Chart by Date */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Doanh thu theo ngày</h2>
            <p className="text-sm text-gray-600 mt-1">Biểu đồ doanh thu hàng ngày trong khoảng thời gian đã chọn</p>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>90 ngày qua</option>
            <option>Tùy chỉnh</option>
          </select>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Biểu đồ doanh thu theo ngày</p>
          <p className="text-sm text-gray-500 mt-2">
            Bar chart hoặc Line chart hiển thị revenue theo date
          </p>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tổng quan thanh toán</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Thống kê chi tiết thanh toán</p>
          <p className="text-sm text-gray-500 mt-2">
            Tổng số giao dịch: <span className="font-semibold">{formatNumber(stats?.paymentCount)}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tổng doanh thu: <span className="font-semibold text-green-600">{formatCurrency(stats?.totalRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách thanh toán</h2>
          <p className="text-sm text-gray-600 mt-1">Các giao dịch đã thanh toán trong khoảng thời gian đã chọn</p>
        </div>
        <div className="p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Bảng danh sách thanh toán</p>
            <p className="text-sm text-gray-500 mt-2">
              Columns: ID Thanh toán | Lịch hẹn | Bệnh nhân | Bác sĩ | Số tiền | Phương thức | Trạng thái | Ngày thanh toán
            </p>
          </div>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-700">Hiển thị 1-20 trong tổng số 245 giao dịch</div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Trước</button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Sau</button>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600 font-medium">Chuyển khoản</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">120</p>
            <p className="text-sm text-gray-500 mt-1">49% giao dịch</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600 font-medium">Ví điện tử</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">80</p>
            <p className="text-sm text-gray-500 mt-1">32.7% giao dịch</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-600 font-medium">Tiền mặt</p>
            <p className="text-3xl font-bold text-green-600 mt-2">45</p>
            <p className="text-sm text-gray-500 mt-1">18.3% giao dịch</p>
          </div>
        </div>
      </div>
    </div>
  );
}

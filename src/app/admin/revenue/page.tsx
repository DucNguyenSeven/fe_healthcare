'use client'

import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Calendar, Users, BarChart3, PieChart, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  useRevenueByTime,
  useRevenueByDoctor,
  useRevenueBySpecialty,
  useRevenueByServiceType
} from '@/hooks/admin/useDashboard';

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

// Helper to convert date to ISO DateTime format
const toISODateTime = (dateString: string): string => {
  // If already includes time, return as is
  if (dateString.includes('T')) return dateString;
  // Otherwise, append time 00:00:00 and convert to ISO format
  return new Date(dateString + 'T00:00:00').toISOString();
};

// Helper to format date for display (DD/MM)
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};

// Custom tooltip for chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          Ngày: {new Date(payload[0].payload.date).toLocaleDateString('vi-VN')}
        </p>
        <p className="text-sm text-green-600 font-semibold">
          Doanh thu: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-sm text-blue-600">
          Lịch hẹn: {payload[0].payload.count}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenuePage() {
  // Get current month's start and end dates
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState({
    startDate: firstDay.toISOString().split('T')[0], // YYYY-MM-DD
    endDate: lastDay.toISOString().split('T')[0],     // YYYY-MM-DD
  });

  // Convert to ISO DateTime format for API
  const dateRangeParams = useMemo(() => ({
    startDate: toISODateTime(dateRange.startDate),
    endDate: toISODateTime(dateRange.endDate),
  }), [dateRange]);

  // Fetch data from API using useDashboard hooks
  const { data: revenueByTime, isLoading: timeLoading, error: timeError, refetch: refetchTime } = useRevenueByTime(dateRangeParams);
  const { data: revenueByDoctor, isLoading: doctorLoading } = useRevenueByDoctor(dateRangeParams);
  const { data: revenueBySpecialty, isLoading: specialtyLoading } = useRevenueBySpecialty(dateRangeParams);
  const { data: revenueByServiceType, isLoading: serviceTypeLoading } = useRevenueByServiceType(dateRangeParams);

  // Calculate overview from revenueByTime data
  const overview = revenueByTime ? {
    totalRevenue: revenueByTime.reduce((sum, item) => sum + item.revenue, 0),
    totalAppointments: revenueByTime.reduce((sum, item) => sum + item.count, 0),
    averagePaymentAmount: revenueByTime.length > 0
      ? revenueByTime.reduce((sum, item) => sum + item.revenue, 0) / revenueByTime.reduce((sum, item) => sum + item.count, 0)
      : 0,
    completedAppointments: revenueByTime.reduce((sum, item) => sum + item.count, 0),
  } : undefined;

  // Combined error state
  if (timeError) {
    const error = timeError;
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
                onClick={() => refetchTime()}
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
  if (timeLoading) {
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
        </div>
        {revenueByTime && revenueByTime.length > 0 ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueByTime}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateForDisplay}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value === 'revenue' ? 'Doanh thu (₫)' : 'Số lịch hẹn'}
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Không có dữ liệu</p>
            <p className="text-sm text-gray-500 mt-2">Chọn khoảng thời gian để xem biểu đồ doanh thu</p>
          </div>
        )}
      </div>

      {/* Revenue by Doctor and Specialty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Doctor */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Doanh thu theo bác sĩ</h2>
            {revenueByDoctor && !revenueByDoctor.empty && (
              <span className="text-sm text-gray-500">
                {revenueByDoctor.totalElements} bác sĩ
              </span>
            )}
          </div>
          {doctorLoading ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center animate-pulse">
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          ) : revenueByDoctor && !revenueByDoctor.empty ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên khoa</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng doanh thu</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số lịch hẹn</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueByDoctor.content.map((doctor, idx) => (
                    <tr key={doctor.doctorId || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doctor.doctorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{doctor.specialty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-green-600">{formatCurrency(doctor.totalRevenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">{formatNumber(doctor.appointmentCount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">{doctor.rating.toFixed(1)} ⭐</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {revenueByDoctor.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{revenueByDoctor.numberOfElements}</span> trên{' '}
                    <span className="font-medium">{revenueByDoctor.totalElements}</span> kết quả
                  </p>
                  <p className="text-sm text-gray-500">
                    Trang {revenueByDoctor.number + 1} / {revenueByDoctor.totalPages}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Không có dữ liệu bác sĩ</p>
            </div>
          )}
        </div>

        {/* Revenue by Specialty */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Doanh thu theo chuyên khoa</h2>
          {specialtyLoading ? (
            <div className="border border-gray-200 rounded-lg p-8 text-center animate-pulse">
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          ) : revenueBySpecialty && revenueBySpecialty.length > 0 ? (
            <div className="space-y-3">
              {revenueBySpecialty.map((specialty, idx) => {
                return (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{specialty.specialty}</p>
                      <p className="text-sm text-gray-500">{specialty.percentage.toFixed(1)}% tổng doanh thu</p>
                      <p className="text-xs text-gray-400 mt-1">{formatNumber(specialty.appointmentCount)} lịch hẹn</p>
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
        ) : revenueByServiceType && revenueByServiceType.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {revenueByServiceType.map((service, idx) => {
              return (
                <div key={idx} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <p className="text-gray-600 font-medium">{service.serviceType}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(service.totalRevenue)}</p>
                  <p className="text-sm text-gray-500 mt-1">{service.percentage.toFixed(1)}% tổng doanh thu</p>
                  <p className="text-xs text-gray-400 mt-1">{formatNumber(service.appointmentCount)} lịch hẹn</p>
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
        {doctorLoading ? (
          <div className="border border-gray-200 rounded-lg p-8 text-center animate-pulse">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        ) : revenueByDoctor && !revenueByDoctor.empty ? (
          <div className="space-y-4">
            {revenueByDoctor.content.slice(0, 10).map((doctor, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;
              const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

              return (
                <div
                  key={doctor.doctorId || idx}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${isTopThree
                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    {isTopThree ? (
                      <div className={`w-12 h-12 rounded-full bg-white border-2 ${rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-gray-300' : 'border-amber-500'
                        } flex items-center justify-center`}>
                        <span className={`text-2xl font-bold ${medalColors[idx]}`}>
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">#{rank}</span>
                      </div>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {doctor.doctorName}
                      </h3>
                      {isTopThree && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Top {rank}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Doanh thu</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(doctor.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lịch hẹn</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatNumber(doctor.appointmentCount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Đánh giá</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {doctor.rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Không có dữ liệu</p>
            <p className="text-sm text-gray-500 mt-2">
              Chọn khoảng thời gian để xem bác sĩ hiệu suất cao
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

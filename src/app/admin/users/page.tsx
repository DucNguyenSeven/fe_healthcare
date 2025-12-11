'use client'

import { useState } from 'react';
import { Users, UserCheck, UserX, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { useUsers, useUserStatistics } from '@/hooks/admin/useUsersData';

// Helper to format numbers
const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export default function UsersPage() {
  const [filters] = useState({ page: 0, size: 20 });

  // Fetch data from API
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useUserStatistics();
  const { data: users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers(filters);

  // Combined error state
  if (statsError || usersError) {
    const error = statsError || usersError;
    return (
      <div className="p-4 lg:p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Không thể tải dữ liệu người dùng</h3>
              <p className="text-red-700 text-sm mb-4">
                {(error as any)?.response?.data?.message || (error as any)?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
              </p>
              <button
                onClick={() => {
                  refetchStats();
                  refetchUsers();
                }}
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
  if (statsLoading || usersLoading) {
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
        {/* Skeleton for filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        {/* Skeleton for table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Tổng người dùng', value: formatNumber(stats?.totalUsers), icon: Users, color: 'bg-blue-500' },
          { title: 'Đang hoạt động', value: formatNumber(stats?.activeUsers), icon: UserCheck, color: 'bg-green-500' },
          { title: 'Không hoạt động', value: formatNumber(stats?.inactiveUsers), icon: UserX, color: 'bg-gray-500' },
          { title: 'Bị chặn', value: formatNumber(stats?.blockedUsers), icon: Shield, color: 'bg-red-500' },
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

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tất cả vai trò</option>
            <option>Bệnh nhân</option>
            <option>Bác sĩ</option>
            <option>Quản trị viên</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Không hoạt động</option>
            <option>Bị chặn</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách người dùng</h2>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {users?.content?.length || 0} người dùng (Tổng: {formatNumber(users?.totalElements)})
          </p>
        </div>
        <div className="p-8">
          {users?.content && users.content.length > 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Bảng dữ liệu người dùng</p>
              <p className="text-sm text-gray-500 mt-2">
                Tìm thấy {users.content.length} người dùng
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Columns: Người dùng | Liên hệ | Vai trò | Trạng thái | Ngày tạo | Đăng nhập cuối | Hành động
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy người dùng nào
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Hiển thị 1-{users?.size || 20} trong tổng số {formatNumber(users?.totalElements)} người dùng
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Trước</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}

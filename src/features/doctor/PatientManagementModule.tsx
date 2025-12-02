'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  User,
  Calendar,
  Activity,
  FileText,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Heart,
  Ruler,
  Weight as WeightIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { usePatientsList } from '@/hooks/patients/usePatientsList';
import { usePatientProfile } from '@/hooks/patients/usePatientProfile';
import { useMedicalHistory } from '@/hooks/medical-records/useMedicalHistory';
import { formatDate } from '@/utils/formatting';
import type { PatientListItem } from '@/lib/api/patients';

// Helper function: Check if prescription is active
const isPrescriptionActive = (endDate: string): boolean => {
  try {
    return new Date(endDate) >= new Date();
  } catch {
    return false;
  }
};

// Helper function: Get BMI color
const getBMIColor = (bmi: number | null | undefined): string => {
  if (!bmi) return 'text-gray-600';
  if (bmi < 18.5) return 'text-yellow-600';
  if (bmi < 25) return 'text-green-600';
  if (bmi < 30) return 'text-orange-600';
  return 'text-red-600';
};

// Helper function: Get BMI category
const getBMICategory = (bmi: number | null | undefined): string => {
  if (!bmi) return 'Chưa cập nhật';
  if (bmi < 18.5) return 'Thiếu cân';
  if (bmi < 25) return 'Bình thường';
  if (bmi < 30) return 'Thừa cân';
  return 'Béo phì';
};

// @component: PatientManagementModule
export const PatientManagementModule = () => {
  // ==================== State Management ====================
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedPatient, setSelectedPatient] = useState<PatientListItem | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Pagination & Sorting
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [sortBy] = useState('lastVisitDate');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ==================== Data Fetching ====================

  // Get authenticated doctor
  const { data: user, isLoading: userLoading } = useGetMe();
  const doctorId = user?.userId || '';

  // Fetch patients list
  const {
    data: patientsData,
    isLoading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients
  } = usePatientsList({
    doctorId,
    page,
    size: pageSize,
    sortBy,
    sortDir,
    namePatient: debouncedSearch || undefined
  });

  // Fetch patient profile (only when detail view is active)
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError
  } = usePatientProfile(doctorId, selectedPatient?.patientId || '');

  // Fetch medical history (only when detail view is active)
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError
  } = useMedicalHistory({
    doctorId,
    patientId: selectedPatient?.patientId || '',
    page: 0,
    size: 50
  });

  // Combined loading state
  const isLoading = userLoading || patientsLoading;

  // ==================== Event Handlers ====================

  const handleViewPatient = (patient: PatientListItem) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
    setActiveTab('profile');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPatient(null);
  };

  // ==================== Render Functions ====================

  // Loading State
  const renderLoading = () => (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // Error State
  const renderError = (error: any, onRetry: () => void) => (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">
          Không thể tải dữ liệu
        </p>
        <p className="text-red-500 text-sm mb-4">
          {error?.message || 'Đã xảy ra lỗi'}
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  );

  // Empty State
  const renderEmpty = () => (
    <div className="text-center py-12">
      <User size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Không có bệnh nhân nào
      </h3>
      <p className="text-gray-600">
        {searchTerm ? 'Không tìm thấy bệnh nhân phù hợp' : 'Bạn chưa có bệnh nhân nào'}
      </p>
    </div>
  );

  // Patient List View
  const renderPatientList = () => {
    if (isLoading) return renderLoading();
    if (patientsError) return renderError(patientsError, refetchPatients);
    if (patientsData?.empty) return renderEmpty();

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0F172A]">Danh sách bệnh nhân</h1>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#334155]"
              />
              <input
                type="text"
                placeholder="Tìm kiếm bệnh nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-[#334155]" />
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as 'ASC' | 'DESC')}
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
              >
                <option value="DESC">Khám gần nhất</option>
                <option value="ASC">Khám cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 font-semibold text-[#334155]">Họ tên</th>
                  <th className="text-left py-4 px-2 font-semibold text-[#334155]">Tuổi</th>
                  <th className="text-left py-4 px-2 font-semibold text-[#334155]">Giới tính</th>
                  <th className="text-left py-4 px-2 font-semibold text-[#334155]">Lần khám cuối</th>
                  <th className="text-left py-4 px-2 font-semibold text-[#334155]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {patientsData?.content.map((patient, index) => (
                  <motion.tr
                    key={patient.patientId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1E75FF] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {patient.fullName.split(' ').pop()?.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-[#0F172A]">{patient.fullName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-[#334155]">{patient.age}</td>
                    <td className="py-4 px-2 text-[#334155]">
                      {patient.gender === 'MALE' ? 'Nam' : 'Nữ'}
                    </td>
                    <td className="py-4 px-2 text-[#334155]">{patient.lastVisitDate}</td>
                    <td className="py-4 px-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Xem</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
            <div className="text-sm text-[#334155]">
              Hiển thị{' '}
              <span className="font-semibold text-[#0F172A]">
                {page * pageSize + 1} -{' '}
                {Math.min((page + 1) * pageSize, patientsData?.totalElements || 0)}
              </span>
              {' '}trong tổng số{' '}
              <span className="font-semibold text-[#0F172A]">{patientsData?.totalElements || 0}</span>
              {' '}bệnh nhân
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!patientsData || patientsData.first || page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 border border-gray-300 rounded-xl text-[#334155] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-[#334155]">
                Trang {page + 1} / {patientsData?.totalPages || 1}
              </span>
              <button
                disabled={!patientsData || patientsData.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-[#334155] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Patient Detail View
  const renderPatientDetail = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBackToList}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={24} className="text-[#334155]" />
        </button>
        <h1 className="text-3xl font-bold text-[#0F172A]">Chi tiết bệnh nhân</h1>
      </div>

      {/* Detail Card */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedPatient?.fullName}</h2>
              <div className="flex items-center gap-4 text-white/80">
                <span>{selectedPatient?.age} tuổi</span>
                <span>•</span>
                <span>{selectedPatient?.gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex">
            {[
              { id: 'profile', label: 'Hồ sơ', icon: User },
              { id: 'lab', label: 'Xét nghiệm', icon: Activity },
              { id: 'consultations', label: 'Tư vấn', icon: Calendar },
              { id: 'treatment', label: 'Phác đồ', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#1E75FF] border-b-2 border-[#1E75FF]'
                      : 'text-[#334155] hover:text-[#1E75FF]'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'lab' && renderLabTab()}
              {activeTab === 'consultations' && renderConsultationsTab()}
              {activeTab === 'treatment' && renderTreatmentTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  // Tab 1: Profile
  const renderProfileTab = () => {
    if (profileLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#1E75FF]" />
        </div>
      );
    }

    if (profileError) {
      return (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-600">Không thể tải thông tin hồ sơ</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Phone size={20} className="text-[#334155]" />
              <div>
                <p className="text-sm text-[#334155]">Số điện thoại</p>
                <p className="font-medium text-[#0F172A]">
                  {profileData?.phone || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail size={20} className="text-[#334155]" />
              <div>
                <p className="text-sm text-[#334155]">Email</p>
                <p className="font-medium text-[#0F172A]">
                  {profileData?.email || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar size={20} className="text-[#334155]" />
              <div>
                <p className="text-sm text-[#334155]">Ngày sinh</p>
                <p className="font-medium text-[#0F172A]">
                  {profileData?.dob || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin size={20} className="text-[#334155]" />
              <div>
                <p className="text-sm text-[#334155]">Địa chỉ</p>
                <p className="font-medium text-[#0F172A]">
                  {profileData?.address || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Heart size={20} className="text-[#334155]" />
              <div>
                <p className="text-sm text-[#334155]">Nhóm máu</p>
                <p className="font-medium text-[#0F172A]">
                  {profileData?.bloodType || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Ruler size={18} className="text-[#334155]" />
                <div>
                  <p className="text-xs text-[#334155]">Chiều cao</p>
                  <p className="font-medium text-sm text-[#0F172A]">
                    {profileData?.height ? `${profileData.height} cm` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <WeightIcon size={18} className="text-[#334155]" />
                <div>
                  <p className="text-xs text-[#334155]">Cân nặng</p>
                  <p className="font-medium text-sm text-[#0F172A]">
                    {profileData?.weight ? `${profileData.weight} kg` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Activity size={18} className="text-[#334155]" />
                <div>
                  <p className="text-xs text-[#334155]">BMI</p>
                  <p className={`font-medium text-sm ${getBMIColor(profileData?.bmi)}`}>
                    {profileData?.bmi ? profileData.bmi.toFixed(1) : 'N/A'}
                  </p>
                  {profileData?.bmi && (
                    <p className="text-xs text-gray-600">{getBMICategory(profileData.bmi)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab 2: Lab Results (Keep existing implementation - use existing API)
  const renderLabTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Kết quả xét nghiệm</h3>
      <p className="text-gray-600">Tính năng đang sử dụng API hiện có (chưa thay đổi)</p>
    </div>
  );

  // Tab 3: Consultations
  const renderConsultationsTab = () => {
    if (historyLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#1E75FF]" />
        </div>
      );
    }

    if (historyError) {
      return (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-600">Không thể tải lịch sử tư vấn</p>
        </div>
      );
    }

    if (!historyData?.content || historyData.content.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Chưa có lịch sử tư vấn</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Lịch sử tư vấn</h3>
        <div className="space-y-4">
          {historyData.content.map((record) => (
            <div key={record.recordId} className="border-l-4 border-[#1E75FF] pl-6 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-[#0F172A]">{record.serviceName}</h4>
                    {record.episodeType && (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          record.episodeType === 'INITIAL'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {record.episodeType === 'INITIAL' ? 'Khám đầu' : 'Tái khám'}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#334155]">{formatDate(record.appointmentDate)}</span>
              </div>
              <div className="space-y-2 text-gray-700">
                {record.symptoms && (
                  <p>
                    <strong>Triệu chứng:</strong> {record.symptoms}
                  </p>
                )}
                <p>
                  <strong>Chẩn đoán:</strong> {record.diagnosis}
                </p>
                {record.treatment && (
                  <p>
                    <strong>Điều trị:</strong> {record.treatment}
                  </p>
                )}
                {record.doctorNote && (
                  <p>
                    <strong>Ghi chú:</strong> {record.doctorNote}
                  </p>
                )}
              </div>
              {record.imageAttachments && record.imageAttachments.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {record.imageAttachments.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Attachment ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tab 4: Treatment Plan
  const renderTreatmentTab = () => {
    if (historyLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#1E75FF]" />
        </div>
      );
    }

    if (historyError) {
      return (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-red-600">Không thể tải phác đồ điều trị</p>
        </div>
      );
    }

    if (!historyData?.content || historyData.content.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Chưa có phác đồ điều trị</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Phác đồ điều trị</h3>

        {historyData.content.map((record) => {
          if (!record.prescriptions || record.prescriptions.length === 0) return null;

          return (
            <div key={record.recordId} className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-[#0F172A]">
                    {formatDate(record.appointmentDate)} - {record.serviceName}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{record.diagnosis}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-[#0F172A]">Thuốc</h5>
                {record.prescriptions.map((prescription) => {
                  const isActive = isPrescriptionActive(prescription.endDate);
                  return (
                    <div key={prescription.prescriptionId} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">
                            {prescription.medicalName} - {prescription.dosage}
                          </h6>
                          <p className="text-sm text-gray-600 mt-1">
                            Tần suất: {prescription.frequency.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Thời gian: {formatDate(prescription.startDate)} -{' '}
                            {formatDate(prescription.endDate)}
                          </p>
                          {prescription.duration && (
                            <p className="text-sm text-gray-600">Liệu trình: {prescription.duration}</p>
                          )}
                          {prescription.notes && (
                            <p className="text-sm text-gray-600 mt-1">Ghi chú: {prescription.notes}</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isActive ? 'Đang dùng' : 'Đã hết hạn'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Main Render
  return (
    <div className="h-full bg-[#F6F7FB]">
      {currentView === 'list' ? renderPatientList() : renderPatientDetail()}
    </div>
  );
};

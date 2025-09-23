"use client";

import React, { useEffect } from 'react';
import { X, User, Stethoscope, Calendar, FileText, Pill, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useMedicalResultsByAppointment } from '@/hooks/medical-results';

interface MedicalResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientInfo?: {
    name: string;
    id: string;
    phone?: string;
    email?: string;
    age?: number;
    gender?: string;
  };
  doctorInfo?: {
    name: string;
    specialty?: string;
    id?: string;
  };
}

export function MedicalResultModal({ isOpen, onClose, appointmentId, patientInfo, doctorInfo }: MedicalResultModalProps) {
  // API hook
  const { fetchMedicalResults, loading, error, data, clearError } = useMedicalResultsByAppointment();

  // Fetch data when modal opens and appointmentId changes
  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchMedicalResults(appointmentId);
    }
  }, [isOpen, appointmentId, fetchMedicalResults]);

  // Patient info for display
  const patient = {
    name: patientInfo?.name || 'Bệnh nhân',
    id: patientInfo?.id || '',
    phone: patientInfo?.phone || '',
    email: patientInfo?.email || '',
    age: patientInfo?.age || 0,
    gender: patientInfo?.gender || ''
  };

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold truncate">{patient.name}</h2>
              <p className="text-blue-100 text-xs sm:text-sm truncate">ID: {patient.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)] p-4 sm:p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
              <span className="text-gray-600">Đang tải kết quả khám...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <h3 className="font-medium text-red-800">Không thể tải kết quả khám</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  clearError();
                  fetchMedicalResults(appointmentId);
                }}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Content - Only show when data is loaded */}
          {data && !loading && !error && (
          <div className="space-y-4 sm:space-y-6">
            {/* Appointment Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Thông tin cuộc hẹn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Mã cuộc hẹn:</span>
                  <p className="font-medium">{data.medicalRecord.appointmentId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Dịch vụ:</span>
                  <p className="font-medium">{data.medicalRecord.serviceName || 'Khám tổng quát'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ngày tạo:</span>
                  <p className="font-medium">{new Date(data.medicalRecord.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            {doctorInfo && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Bác sĩ khám
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên bác sĩ:</span>
                    <span className="font-medium">{doctorInfo.name}</span>
                  </div>
                  {doctorInfo.specialty && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chuyên khoa:</span>
                      <span className="font-medium">{doctorInfo.specialty}</span>
                    </div>
                  )}
                  {doctorInfo.id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã bác sĩ:</span>
                      <span className="font-medium">{doctorInfo.id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                Thông tin bệnh nhân
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-medium">{patient.name}</span>
                </div>
                {patient.age > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuổi:</span>
                    <span className="font-medium">{patient.age} tuổi</span>
                  </div>
                )}
                {patient.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giới tính:</span>
                    <span className="font-medium">{patient.gender}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điện thoại:</span>
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{patient.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                Kết quả khám và chẩn đoán
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  {data.medicalRecord.diagnosis && (
                    <div>
                      <span className="text-gray-600 font-medium">Chẩn đoán:</span>
                      <p className="mt-1 p-3 bg-purple-50 border border-purple-200 rounded-lg font-medium text-purple-800">
                        {data.medicalRecord.diagnosis}
                      </p>
                    </div>
                  )}
                  {data.medicalRecord.symptoms && (
                    <div>
                      <span className="text-gray-600 font-medium">Triệu chứng:</span>
                      <p className="mt-1 text-gray-800">{data.medicalRecord.symptoms}</p>
                    </div>
                  )}
                  {data.medicalRecord.statusHealth && (
                    <div>
                      <span className="text-gray-600 font-medium">Tình trạng sức khỏe:</span>
                      <div className="mt-1 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-green-700 font-medium">{data.medicalRecord.statusHealth}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {data.medicalRecord.treatment && (
                    <div>
                      <span className="text-gray-600 font-medium">Phương pháp điều trị:</span>
                      <p className="mt-1 text-gray-800">{data.medicalRecord.treatment}</p>
                    </div>
                  )}
                  {data.medicalRecord.followUpDate && (
                    <div>
                      <span className="text-gray-600 font-medium">Ngày tái khám:</span>
                      <div className="mt-1 flex items-center">
                        <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="font-medium">{new Date(data.medicalRecord.followUpDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  )}
                  {data.medicalRecord.serviceName && (
                    <div>
                      <span className="text-gray-600 font-medium">Dịch vụ khám:</span>
                      <p className="mt-1 text-gray-800">{data.medicalRecord.serviceName}</p>
                    </div>
                  )}
                </div>
              </div>
              {data.medicalRecord.doctorNote && (
                <div className="mt-4">
                  <span className="text-gray-600 font-medium">Ghi chú của bác sĩ:</span>
                  <p className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                    {data.medicalRecord.doctorNote}
                  </p>
                </div>
              )}
            </div>

            {/* Prescriptions */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                Đơn thuốc
              </h3>
              <div className="space-y-4">
                {data.prescriptions && data.prescriptions.length > 0 ? (
                  data.prescriptions.map((prescription, index) => (
                    <div key={prescription.prescriptionId} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-1 sm:gap-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{index + 1}. {prescription.medicalName}</h4>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(prescription.startDate).toLocaleDateString('vi-VN')} - {new Date(prescription.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Liều lượng:</span>
                          <p className="font-medium">{prescription.dosage}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tần suất:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prescription.frequency.map((freq, i) => (
                              <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                {freq === 'MORNING' ? 'Sáng' : freq === 'EVENING' ? 'Tối' : freq === 'AFTERNOON' ? 'Chiều' : freq}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ghi chú:</span>
                          <p className="text-gray-800">{prescription.notes || 'Không có ghi chú'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Không có đơn thuốc nào được kê</p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-orange-800 font-medium">Lưu ý quan trọng:</p>
                    <p className="text-orange-700 text-sm mt-1">
                      Dùng thuốc đúng liều lượng và thời gian. Nếu có tác dụng phụ, hãy liên hệ bác sĩ ngay lập tức.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
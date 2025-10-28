"use client";

import React, { useEffect, useState } from 'react';
import { X, User, Stethoscope, Calendar, FileText, Pill, AlertCircle, CheckCircle, Loader2, ClipboardList, AlertTriangle, Activity, Phone, Mail } from 'lucide-react';
import { useMedicalResultsByAppointment } from '@/hooks/medical-results';
import { getMedicalRecordById, getMedicalRecordTimeline } from '@/lib/api/medical-records';
import type { MedicalRecordWithPrescriptions } from '@/types/medical-record';
import type { MedicalRecordTimelineResponse, MedicalRecordWithEpisode } from '@/lib/api/medical-records';
import { MedicalRecordTimeline } from '@/components/medical-records/MedicalRecordTimeline';

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

  // State for full medical record data (with signature)
  const [fullRecord, setFullRecord] = useState<MedicalRecordWithPrescriptions | null>(null);
  const [loadingFullRecord, setLoadingFullRecord] = useState(false);

  // State for tabs
  const [activeTab, setActiveTab] = useState<'current' | 'timeline'>('current');

  // State for timeline data
  const [timelineData, setTimelineData] = useState<MedicalRecordTimelineResponse | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  // Fetch medical results when modal opens
  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchMedicalResults(appointmentId);
      setFullRecord(null); // Reset full record
      setTimelineData(null); // Reset timeline data
      setActiveTab('current'); // Reset to current tab
      setTimelineError(null); // Reset timeline error
    }
  }, [isOpen, appointmentId, fetchMedicalResults]);

  // Fetch full medical record (with signature) after getting recordId
  useEffect(() => {
    const fetchFullRecord = async () => {
      if (data?.medicalRecord?.recordId) {
        setLoadingFullRecord(true);
        try {
          const response = await getMedicalRecordById(data.medicalRecord.recordId);
          if (response.success && response.data) {
            setFullRecord(response.data);
          }
        } catch (err) {
          console.error('Error fetching full medical record:', err);
        } finally {
          setLoadingFullRecord(false);
        }
      }
    };

    fetchFullRecord();
  }, [data?.medicalRecord?.recordId]);

  // Fetch timeline after getting recordId
  useEffect(() => {
    const fetchTimeline = async () => {
      if (data?.medicalRecord?.recordId) {
        setLoadingTimeline(true);
        setTimelineError(null);
        try {
          console.log('🔍 [MedicalResultModal] Fetching timeline for recordId:', data.medicalRecord.recordId);
          const response = await getMedicalRecordTimeline(data.medicalRecord.recordId);
          if (response.success && response.data) {
            console.log('✅ [MedicalResultModal] Timeline fetched successfully:', {
              hasRootRecord: !!response.data.rootRecord,
              followUpCount: response.data.followUpRecords?.length || 0
            });
            setTimelineData(response.data);
          } else {
            console.warn('⚠️ [MedicalResultModal] Timeline fetch failed:', response.message);
            setTimelineError(response.message || 'Không thể tải lịch sử khám');
          }
        } catch (err) {
          console.error('❌ [MedicalResultModal] Error fetching timeline:', err);
          setTimelineError('Có lỗi xảy ra khi tải lịch sử khám');
        } finally {
          setLoadingTimeline(false);
        }
      }
    };

    fetchTimeline();
  }, [data?.medicalRecord?.recordId]);

  // Merge rootRecord + followUpRecords into single array for timeline display
  const allTimelineRecords = React.useMemo(() => {
    if (!timelineData) return [];

    const records: MedicalRecordWithEpisode[] = [];

    // Add root record first (initial examination)
    if (timelineData.rootRecord) {
      records.push(timelineData.rootRecord);
    }

    // Add follow-up records
    if (timelineData.followUpRecords && timelineData.followUpRecords.length > 0) {
      records.push(...timelineData.followUpRecords);
    }

    // Sort by appointmentDate ascending (old → new)
    const sortedRecords = records.sort((a, b) => {
      const dateA = new Date(a.appointmentDate || a.createdAt).getTime();
      const dateB = new Date(b.appointmentDate || b.createdAt).getTime();
      return dateA - dateB;
    });

    console.log('📋 [MedicalResultModal] Merged timeline records:', {
      totalRecords: sortedRecords.length,
      records: sortedRecords.map(r => ({
        recordId: r.recordId,
        diagnosis: r.diagnosis,
        appointmentDate: r.appointmentDate,
        episodeType: r.episodeType
      }))
    });

    return sortedRecords;
  }, [timelineData]);

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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header - Full width with rounded top corners */}
        <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-semibold mb-6 pr-12">
            Chi tiết hồ sơ khám - {data ? new Date(data.medicalRecord.appointmentDate || data.medicalRecord.createdAt).toLocaleDateString('vi-VN') : ''}
          </h2>

          {/* Appointment Details */}
          {data && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Bác sĩ</p>
                <p className="font-medium">BS. {doctorInfo?.name || 'Chưa có thông tin'}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Dịch vụ</p>
                <p className="font-medium">{data.medicalRecord.serviceName || 'Khám tổng quát'}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Ngày khám</p>
                <p className="font-medium">{new Date(data.medicalRecord.appointmentDate || data.medicalRecord.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              {data.medicalRecord.followUpDate && (
                <div>
                  <p className="text-white/80 text-sm mb-1">Ngày tái khám</p>
                  <p className="font-medium">{new Date(data.medicalRecord.followUpDate).toLocaleDateString('vi-VN')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        {data && !loading && !error && (
          <div className="px-8 pt-6 pb-0">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'current'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Kết quả lần này
                </span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Lịch sử khám đầy đủ
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
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
          {data && !loading && !error && activeTab === 'current' && (
          <div className="space-y-6">
            {/* Patient Information */}
            {(fullRecord?.patient || patientInfo) && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
                <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin bệnh nhân
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                    <p className="font-semibold text-gray-900">
                      {fullRecord?.patient?.fullName || patient.name}
                    </p>
                  </div>
                  
                  {(fullRecord?.patient?.email || patient.email) && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="font-medium text-gray-900">
                        {fullRecord?.patient?.email || patient.email}
                      </p>
                    </div>
                  )}
                  
                  {(fullRecord?.patient?.phone || patient.phone) && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </p>
                      <p className="font-medium text-gray-900">
                        {fullRecord?.patient?.phone || patient.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnosis */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Chẩn đoán
              </h4>
              <p className="text-gray-700">{data.medicalRecord.diagnosis}</p>
            </div>

            {/* Symptoms */}
            {data.medicalRecord.symptoms && (
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Triệu chứng
                </h4>
                <p className="text-gray-700 whitespace-pre-line">{data.medicalRecord.symptoms}</p>
              </div>
            )}

            {/* Treatment */}
            {data.medicalRecord.treatment && (
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Điều trị
                </h4>
                <p className="text-gray-700">{data.medicalRecord.treatment}</p>
              </div>
            )}

            {/* Doctor Notes */}
            {data.medicalRecord.doctorNote && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Ghi chú của bác sĩ
                </h4>
                <p className="text-gray-700">{data.medicalRecord.doctorNote}</p>
              </div>
            )}

            {/* Prescriptions */}
            {data.prescriptions.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-2xl">
                <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" />
                  Đơn thuốc ({data.prescriptions.length} loại thuốc)
                </h4>
                <div className="space-y-3">
                  {data.prescriptions.map((prescription, index) => {
                    const frequencies = Array.isArray(prescription.frequency) ? prescription.frequency : [prescription.frequency];
                    return (
                      <div
                        key={prescription.prescriptionId}
                        className="bg-white p-4 rounded-xl border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-1">
                                {prescription.medicationName}
                              </h5>
                              <p className="text-sm text-gray-600">
                                Liều lượng: <span className="font-medium">{prescription.dosage}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Tần suất:</p>
                            <div className="flex flex-wrap gap-1">
                              {frequencies.map((freq, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium"
                                >
                                  {freq === 'MORNING' ? 'Sáng' : freq === 'EVENING' ? 'Tối' : freq === 'AFTERNOON' ? 'Chiều' : freq}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Thời gian:</p>
                            <p className="font-medium text-gray-900">
                              {new Date(prescription.startDate).toLocaleDateString('vi-VN')} - {new Date(prescription.endDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        {prescription.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Ghi chú:</span> {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Doctor Signature */}
            {fullRecord?.signatureUrl && (
              <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl">
                <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Chữ ký bác sĩ
                </h4>
                <div className="flex justify-center items-center py-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Bác sĩ điều trị</p>
                    <p className="text-3xl font-semibold text-indigo-900 italic">
                      {fullRecord.signatureUrl}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Close Button for Current Tab */}
          {data && !loading && !error && activeTab === 'current' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Timeline Tab Content */}
          {data && !loading && !error && activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Loading State for Timeline */}
              {loadingTimeline && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                  <span className="text-gray-600">Đang tải lịch sử khám...</span>
                </div>
              )}

              {/* Timeline Error State */}
              {timelineError && !loadingTimeline && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-800">Không thể tải lịch sử khám</h3>
                      <p className="text-red-600 mt-1">{timelineError}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (data?.medicalRecord?.recordId) {
                        setLoadingTimeline(true);
                        setTimelineError(null);
                        try {
                          const response = await getMedicalRecordTimeline(data.medicalRecord.recordId);
                          if (response.success && response.data) {
                            setTimelineData(response.data);
                          } else {
                            setTimelineError(response.message || 'Không thể tải lịch sử khám');
                          }
                        } catch (err) {
                          setTimelineError('Có lỗi xảy ra khi tải lịch sử khám');
                        } finally {
                          setLoadingTimeline(false);
                        }
                      }
                    }}
                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Timeline Component */}
              {allTimelineRecords.length > 0 && !loadingTimeline && !timelineError && (
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Lịch sử khám bệnh đầy đủ ({allTimelineRecords.length} lần khám)
                  </h3>
                  <MedicalRecordTimeline
                    allRecords={allTimelineRecords}
                  />
                </div>
              )}

              {/* No Timeline Data State */}
              {allTimelineRecords.length === 0 && !loadingTimeline && !timelineError && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-700 mb-1">Chưa có lịch sử khám</h3>
                  <p className="text-gray-500 text-sm">Đây là lần khám đầu tiên của bệnh nhân</p>
                </div>
              )}

              {/* Close Button for Timeline Tab */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

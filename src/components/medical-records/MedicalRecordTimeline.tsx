'use client';

import React from 'react';
import { Calendar, Pill, FileText, User, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import type { MedicalRecordWithEpisode } from '@/lib/api/medical-records';
import { useDownloadPrescription } from '@/hooks/use-download-prescription';

interface MedicalRecordTimelineProps {
  allRecords: MedicalRecordWithEpisode[];
  onRecordClick?: (record: MedicalRecordWithEpisode) => void;
}

/**
 * Component hiển thị timeline lịch sử khám bệnh
 * Hiển thị TẤT CẢ các record của bệnh nhân theo thứ tự thời gian (mới → cũ)
 */
export const MedicalRecordTimeline: React.FC<MedicalRecordTimelineProps> = ({
  allRecords,
  onRecordClick,
}) => {
  // Hook for downloading prescription PDF
  const { downloadPDF, isDownloading } = useDownloadPrescription();

  // Sort records từ mới đến cũ (DESC)
  const sortedRecords = React.useMemo(() => {
    return [...allRecords].sort((a, b) => {
      const dateA = new Date(a.appointmentDate || a.createdAt).getTime();
      const dateB = new Date(b.appointmentDate || b.createdAt).getTime();
      return dateB - dateA; // Mới nhất trước (DESC)
    });
  }, [allRecords]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderRecord = (record: MedicalRecordWithEpisode, index: number, totalRecords: number) => {
    const isLast = index === totalRecords - 1;
    const isFirst = index === 0; // isFirst giờ là record mới nhất

    return (
      <div key={record.recordId} className="relative pb-8 last:pb-0">
        {/* Timeline Line */}
        {!isLast && (
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
        )}

        {/* Timeline Node */}
        <div className="relative flex items-start gap-4">
          {/* Icon Circle */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
              isFirst
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {isFirst ? (
              <FileText className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </div>

          {/* Content Card */}
          <div
            className={`flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${
              onRecordClick ? 'cursor-pointer' : ''
            }`}
            onClick={onRecordClick ? () => onRecordClick(record) : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isFirst
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {isFirst ? 'Khám gần nhất' : `Lần khám ${totalRecords - index}`}
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {formatDate(record.appointmentDate || record.createdAt)} • {formatTime(record.appointmentDate || record.createdAt)}
                  </span>
                </div>
              </div>

              {/* Download Button - Top right corner */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadPDF(record.recordId);
                  }}
                  disabled={isDownloading(record.recordId)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  title="Tải đơn thuốc PDF"
                >
                  {isDownloading(record.recordId) ? (
                    <>
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Tải đơn thuốc</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              {/* Diagnosis */}
              {record.diagnosis && (
                <div>
                  <p className="text-gray-600 font-medium flex items-center gap-1">
                    <span>🩺</span> Chẩn đoán:
                  </p>
                  <p className="text-gray-800">{record.diagnosis}</p>
                </div>
              )}

              {/* Symptoms */}
              {record.symptoms && (
                <div>
                  <p className="text-gray-600 font-medium flex items-center gap-1">
                    <span>⚡</span> Triệu chứng:
                  </p>
                  <p className="text-gray-800">{record.symptoms}</p>
                </div>
              )}

              {/* Treatment */}
              {record.treatment && (
                <div>
                  <p className="text-gray-600 font-medium flex items-center gap-1">
                    <span>💉</span> Điều trị:
                  </p>
                  <p className="text-gray-800">{record.treatment}</p>
                </div>
              )}

              {/* Doctor Note */}
              {record.doctorNote && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-gray-600 font-medium flex items-center gap-1 mb-1">
                    <span>📝</span> Ghi chú của bác sĩ:
                  </p>
                  <p className="text-gray-800">{record.doctorNote}</p>
                </div>
              )}

              {/* Prescriptions */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div>
                  <p className="text-gray-600 font-medium mb-2 flex items-center gap-1">
                    <Pill className="w-4 h-4" />
                    Toa thuốc ({record.prescriptions.length} loại):
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {record.prescriptions.map((prescription, idx) => {
                      // Parse frequency từ backend
                      const parseFrequency = (freq: string | string[]): string[] => {
                        try {
                          if (Array.isArray(freq)) return freq;
                          // Remove braces and split by comma
                          const cleaned = String(freq).replace(/[{}]/g, '');
                          return cleaned.split(',').map(f => f.trim());
                        } catch {
                          return [];
                        }
                      };

                      // Map frequency sang tiếng Việt
                      const frequencyMap: Record<string, string> = {
                        'MORNING': 'Sáng',
                        'AFTERNOON': 'Chiều',
                        'EVENING': 'Tối'
                      };

                      const frequencies = parseFrequency(prescription.frequency);

                      // Format dates
                      const formatPrescriptionDate = (dateStr: string | null | undefined) => {
                        if (!dateStr) return null;
                        try {
                          return new Date(dateStr).toLocaleDateString('vi-VN');
                        } catch {
                          return null;
                        }
                      };

                      const startDate = formatPrescriptionDate(prescription.startDate);
                      const endDate = formatPrescriptionDate(prescription.endDate);

                      return (
                        <div
                          key={prescription.prescriptionId || idx}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span className="text-gray-500">{idx + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-1">
                              {prescription.medicalName}
                            </p>
                            <p className="text-gray-600 mb-1">
                              Liều lượng: {prescription.dosage}
                            </p>
                            
                            {/* Frequency section with label */}
                            {frequencies.length > 0 && (
                              <div className="mb-1">
                                <span className="text-gray-600">Tần suất:</span>
                                <div className="inline-flex flex-wrap gap-1 ml-1">
                                  {frequencies.map((freq, freqIdx) => (
                                    <span
                                      key={freqIdx}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                    >
                                      {frequencyMap[freq] || freq}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Time period */}
                            {(startDate || endDate) && (
                              <p className="text-gray-600 mb-1">
                                Thời gian: {startDate || '--'} - {endDate || '--'}
                              </p>
                            )}

                            {prescription.notes && (
                              <p className="text-gray-500 italic mt-1">{prescription.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Health Status & Stage */}
              {(record.statusHealth || record.stage) && (
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  {record.statusHealth && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 text-xs">Tình trạng:</span>
                      <span className="text-xs font-medium text-gray-800">
                        {record.statusHealth}
                      </span>
                    </div>
                  )}
                  {record.stage && record.stage > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-600 text-xs">Giai đoạn:</span>
                      <span className="text-xs font-medium text-gray-800">
                        {record.stage}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!sortedRecords || sortedRecords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có dữ liệu lịch sử khám
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Render tất cả records theo thứ tự thời gian (mới → cũ) */}
      {sortedRecords.map((record, index) =>
        renderRecord(record, index, sortedRecords.length)
      )}
    </div>
  );
};

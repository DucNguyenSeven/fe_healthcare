'use client';

import React from 'react';
import { Calendar, Pill, FileText, User, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MedicalRecordWithEpisode } from '@/lib/api/medical-records';

interface MedicalRecordTimelineProps {
  rootRecord: MedicalRecordWithEpisode;
  followUpRecords: MedicalRecordWithEpisode[];
}

/**
 * Component hiển thị timeline lịch sử khám bệnh
 * Bao gồm record gốc (INITIAL) và tất cả các lần tái khám (FOLLOW_UP)
 */
export const MedicalRecordTimeline: React.FC<MedicalRecordTimelineProps> = ({
  rootRecord,
  followUpRecords,
}) => {
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

  const renderRecord = (record: MedicalRecordWithEpisode, index: number, isRoot: boolean) => {
    const isLast = !isRoot && index === followUpRecords.length - 1;

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
              isRoot
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {isRoot ? (
              <FileText className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </div>

          {/* Content Card */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isRoot
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {isRoot ? 'Khám đầu' : `Tái khám lần ${index + 1}`}
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {formatDate(record.createdAt)} • {formatTime(record.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="mb-3">
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                {record.diagnosis}
              </h4>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              {/* Symptoms */}
              {record.symptoms && (
                <div>
                  <p className="text-gray-600 font-medium">Triệu chứng:</p>
                  <p className="text-gray-800">{record.symptoms}</p>
                </div>
              )}

              {/* Treatment */}
              {record.treatment && (
                <div>
                  <p className="text-gray-600 font-medium">Điều trị:</p>
                  <p className="text-gray-800">{record.treatment}</p>
                </div>
              )}

              {/* Doctor Note */}
              {record.doctorNote && (
                <div>
                  <p className="text-gray-600 font-medium">Ghi chú bác sĩ:</p>
                  <p className="text-gray-800 italic">{record.doctorNote}</p>
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
                    {record.prescriptions.map((prescription, idx) => (
                      <div
                        key={prescription.prescriptionId || idx}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="text-gray-500">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {prescription.medicationName}
                          </p>
                          <p className="text-gray-600">
                            {prescription.dosage} - {prescription.frequency?.join(', ')}
                          </p>
                          {prescription.notes && (
                            <p className="text-gray-500 italic">{prescription.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
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

  if (!rootRecord) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có dữ liệu lịch sử khám
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Root Record */}
      {renderRecord(rootRecord, 0, true)}

      {/* Follow-up Records */}
      {followUpRecords && followUpRecords.length > 0 ? (
        followUpRecords.map((record, index) => renderRecord(record, index, false))
      ) : (
        <div className="relative pl-12 pt-4">
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="font-medium">Chưa có lần tái khám nào</p>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { VisitDetail } from '@/types/medical-record';
import { PrescriptionList } from './PrescriptionList';

interface VisitCardProps {
  visit: VisitDetail;
  visitNumber: number;
  isLast: boolean;
}

/**
 * Individual visit card component
 * Shows visit details with expand/collapse functionality
 * Integrates PrescriptionList for medication display
 */
export const VisitCard: React.FC<VisitCardProps> = ({ visit, visitNumber, isLast }) => {
  const [expanded, setExpanded] = useState(visit.isCurrentVisit); // Auto-expand current visit

  const visitDate = visit.appointmentDate
    ? format(new Date(visit.appointmentDate), 'dd/MM/yyyy • HH:mm', { locale: vi })
    : format(new Date(visit.createdAt), 'dd/MM/yyyy', { locale: vi });

  const getVisitIcon = () => {
    if (visit.isCurrentVisit) return '🔵';
    if (visit.episodeType === 'FOLLOW_UP') return '🟢';
    return '📍';
  };

  const getVisitLabel = () => {
    if (visit.episodeType === 'FOLLOW_UP') {
      return `Tái khám lần ${visitNumber - 1}`;
    }
    return 'Khám ban đầu';
  };

  // Tailwind classes for timeline dot
  const getDotClass = () => {
    const baseClass = 'absolute left-0 top-2 w-6 h-6 rounded-full border-3 border-white shadow-md z-10';
    if (visit.isCurrentVisit) return `${baseClass} bg-blue-600`;
    if (visit.episodeType === 'FOLLOW_UP') return `${baseClass} bg-green-500`;
    return `${baseClass} bg-gray-500`;
  };

  return (
    <div className="relative mb-6 pl-12 last:mb-0">
      {/* Timeline dot */}
      <div className={getDotClass()} style={{ borderWidth: '3px' }} />

      {/* Visit card */}
      <div className={`border rounded-xl p-4 bg-white transition-all duration-200 hover:shadow-md ${
        visit.isCurrentVisit
          ? 'border-2 border-blue-600 bg-blue-50 shadow-lg shadow-blue-200/50'
          : 'border-gray-300'
      }`}>
        <div
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded(!expanded);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{getVisitIcon()}</span>
            <span className="text-base font-semibold text-gray-900">Lần khám {visitNumber}</span>
            {visit.isCurrentVisit && (
              <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium">
                Hiện tại
              </span>
            )}
          </div>
          <div className="text-gray-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          📅 {visitDate} | {getVisitLabel()}
        </div>

        {/* Preview (collapsed) */}
        {!expanded && (
          <div className="mt-2 text-sm text-gray-600 truncate">
            Chẩn đoán: {visit.diagnosis || 'N/A'}
          </div>
        )}

        {/* Full details (expanded) */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Symptoms */}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">⚡ Triệu chứng:</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{visit.symptoms || 'N/A'}</div>
            </div>

            {/* Diagnosis */}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">🩺 Chẩn đoán:</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{visit.diagnosis || 'N/A'}</div>
            </div>

            {/* Treatment */}
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">💉 Điều trị:</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{visit.treatment || 'N/A'}</div>
            </div>

            {/* Doctor Note */}
            {visit.doctorNote && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-600 mb-1">📝 Ghi chú của bác sĩ:</div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">{visit.doctorNote}</div>
              </div>
            )}

            {/* Prescriptions */}
            {visit.prescriptions && visit.prescriptions.length > 0 && (
              <PrescriptionList prescriptions={visit.prescriptions} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

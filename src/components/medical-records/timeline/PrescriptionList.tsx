'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PrescriptionResponse } from '@/types/medical-record';

interface PrescriptionListProps {
  prescriptions: PrescriptionResponse[];
}

/**
 * Expandable prescription list component
 * Shows prescription count and allows expanding to see full details
 */
export const PrescriptionList: React.FC<PrescriptionListProps> = ({ prescriptions }) => {
  const [expanded, setExpanded] = useState(false);

  if (!prescriptions || prescriptions.length === 0) {
    return null;
  }

  // Helper function to format frequency - handle both string and array
  const formatFrequency = (frequency: string | string[] | any): string[] => {
    // Handle if frequency is already an array
    if (Array.isArray(frequency)) {
      return frequency;
    }
    // Handle if frequency is a string
    if (typeof frequency === 'string' && frequency) {
      return frequency.split(',').map(f => f.trim());
    }
    // Fallback for null/undefined/invalid
    return [];
  };

  // Helper function to translate frequency
  const translateFrequency = (freq: string): string => {
    const mapping: Record<string, string> = {
      'MORNING': 'Sáng',
      'AFTERNOON': 'Chiều',
      'EVENING': 'Tối',
      'NIGHT': 'Đêm'
    };
    return mapping[freq.toUpperCase()] || freq;
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <div
        className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
        <span className="text-sm font-semibold text-gray-600">
          💊 Đơn thuốc ({prescriptions.length} loại)
        </span>
        <span className="text-gray-600">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {prescriptions.map((prescription, index) => {
            // Safely format frequency
            let frequencies: string[] = [];
            try {
              frequencies = formatFrequency(prescription.frequency);
            } catch (error) {
              console.error('Error formatting frequency:', error, prescription.frequency);
              frequencies = [];
            }

            return (
              <div
                key={prescription.prescriptionId}
                className="flex gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {prescription.medicalName}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    Liều lượng: {prescription.dosage}
                  </div>
                  {frequencies.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 text-xs text-gray-600 mb-1">
                      <span>Tần suất:</span>
                      {frequencies.map((freq, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium"
                        >
                          {translateFrequency(freq)}
                        </span>
                      ))}
                    </div>
                  )}
                  {prescription.notes && (
                    <div className="text-xs text-gray-600 italic mt-1">
                      Ghi chú: {prescription.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

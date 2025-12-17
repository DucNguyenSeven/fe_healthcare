'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { useGetMedicalRecords } from '@/hooks/medical-records/useMedicalRecords';
import { MedicalRecordTimeline } from './MedicalRecordTimeline';
import { MedicalResultModal } from '../MedicalResultModal';
import type { MedicalRecordWithEpisode } from '@/lib/api/medical-records';

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
}

export function MedicalHistoryModal({
  isOpen,
  onClose,
  patientId,
  patientName
}: MedicalHistoryModalProps) {
  // Portal mounting
  const [mounted, setMounted] = useState(false);

  // Fetch medical records
  const { records, loading, error, refetch } = useGetMedicalRecords(patientId);

  // Nested modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordWithEpisode | null>(null);

  // Handle record click
  const handleRecordClick = (record: MedicalRecordWithEpisode) => {
    setSelectedRecord(record);
    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setSelectedRecord(null);
  };

  // ESC key handler - only close if nested modal is not open
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showResultModal) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showResultModal, onClose]);

  // Portal mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-semibold mb-2">
              Lịch sử khám bệnh
            </h2>
            {patientName && (
              <p className="text-blue-100">Bệnh nhân: {patientName}</p>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                <span className="text-gray-600">Đang tải lịch sử khám...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="font-medium text-red-800">
                    Không thể tải lịch sử khám
                  </h3>
                </div>
                <p className="text-red-600 mb-3">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Timeline Content */}
            {!loading && !error && records && records.length > 0 && (
              <MedicalRecordTimeline
                allRecords={records as any}
                onRecordClick={handleRecordClick}
              />
            )}

            {/* Empty State */}
            {!loading && !error && (!records || records.length === 0) && (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có hồ sơ khám bệnh nào</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Nested MedicalResultModal */}
      {selectedRecord && (
        <MedicalResultModal
          isOpen={showResultModal}
          onClose={handleCloseResultModal}
          appointmentId={selectedRecord.appointmentId}
          patientInfo={{
            name: patientName || "Bệnh nhân",
            id: patientId,
          }}
          doctorInfo={{
            name: selectedRecord.doctorName || "Bác sĩ",
            specialty: selectedRecord.serviceName,
          }}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}

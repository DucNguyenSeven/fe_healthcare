"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Pill,
} from "lucide-react";
import type { PrescriptionGroup, MedicationFrequency } from "@/types/dashboard";
import { translateFrequency } from "@/types/dashboard";

interface PrescriptionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionGroup: PrescriptionGroup | null;
}

export function PrescriptionGroupModal({
  isOpen,
  onClose,
  prescriptionGroup,
}: PrescriptionGroupModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !prescriptionGroup || !mounted) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatFrequency = (frequency: MedicationFrequency[]): string => {
    return frequency.map((freq) => translateFrequency(freq)).join(", ");
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chi tiết toa thuốc
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">
                    {prescriptionGroup.doctorName}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{formatDate(prescriptionGroup.createdDate)}</span>
                </div>
                {prescriptionGroup.serviceName && (
                  <div className="flex items-center">
                    <span className="text-gray-500">
                      {prescriptionGroup.serviceName}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {/* Status Badge */}
            <div className="mb-6">
              {prescriptionGroup.isActive ? (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Đang sử dụng</span>
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                  <XCircle className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">Đã hoàn thành</span>
                </div>
              )}
            </div>

            {/* Prescriptions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-blue-600" />
                Danh sách thuốc ({prescriptionGroup.prescriptions.length})
              </h3>

              <div className="space-y-3">
                {prescriptionGroup.prescriptions.map((prescription, index) => (
                  <div
                    key={prescription.prescriptionId}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {prescription.medicalName}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            <span className="font-medium">Liều lượng:</span>{" "}
                            {prescription.dosage}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-11 space-y-2">
                      {/* Frequency */}
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Tần suất:
                          </span>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {formatFrequency(prescription.frequency)}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      {prescription.startDate && prescription.endDate && (
                        <div className="flex items-start">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Thời gian:
                            </span>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {formatDate(prescription.startDate)} -{" "}
                              {formatDate(prescription.endDate)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {prescription.notes && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Ghi chú:
                          </p>
                          <p className="text-sm text-gray-600">
                            {prescription.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

'use client';

import React, { useState } from 'react';
import { Check, FileText, PenLine } from 'lucide-react';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { toast } from 'sonner';

interface SignaturePadProps {
  onSignatureSaved: (doctorName: string) => void;
  disabled?: boolean;
  initialSignatureUrl?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureSaved,
  disabled = false,
  initialSignatureUrl,
}) => {
  const [isSigned, setIsSigned] = useState(!!initialSignatureUrl);
  const [doctorName, setDoctorName] = useState<string | null>(initialSignatureUrl || null);

  const { data: me } = useGetMe();

  const handleSign = () => {
    if (!me?.fullName) {
      toast.error('Không tìm thấy thông tin bác sĩ');
      return;
    }

    setDoctorName(me.fullName);
    setIsSigned(true);
    onSignatureSaved(me.fullName);
    toast.success('Đã ký xác nhận thành công');
  };

  const handleUnsign = () => {
    setIsSigned(false);
    setDoctorName(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-8 mt-6">
      <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Chữ ký xác nhận
        <span className="text-red-500">*</span>
      </h4>

      <div className="space-y-4">
        {/* Signature Display Area */}
        <div className={`relative border-2 rounded-xl p-6 min-h-[120px] flex items-center justify-center transition-colors ${
          isSigned ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}>
          {isSigned && doctorName ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Bác sĩ điều trị</p>
              <p className="text-2xl font-semibold text-[#0F172A] italic">
                {doctorName}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nhấn nút "Ký" để xác nhận</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {isSigned ? (
            <button
              type="button"
              onClick={handleUnsign}
              disabled={disabled}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <PenLine className="w-4 h-4" />
              Hủy chữ ký
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSign}
              disabled={disabled}
              className="flex-1 px-4 py-3 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <PenLine className="w-4 h-4" />
              Ký
            </button>
          )}
        </div>

        {/* Success indicator */}
        {isSigned && doctorName && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Đã ký xác nhận bởi: <strong>{doctorName}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FirstPredictionBanner Component
 * Displays information when user has no previous prediction history (INSUFFICIENT_HISTORY)
 */

import React from 'react';
import { Info } from 'lucide-react';

export function FirstPredictionBanner() {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">Lần dự đoán đầu tiên</h3>

          <div className="space-y-1.5">
            <p className="text-sm text-amber-700">
              Đây là lần dự đoán đầu tiên trong hệ thống. Chưa có dữ liệu trước đó để so sánh xu hướng sức khỏe.
            </p>

            <p className="text-sm text-amber-700 font-medium mt-2">
              💡 Vui lòng thực hiện thêm ít nhất 1 lần chẩn đoán nữa để xem xu hướng thay đổi các chỉ số sức khỏe của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

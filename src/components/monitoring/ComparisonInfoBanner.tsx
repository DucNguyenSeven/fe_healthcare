/**
 * ComparisonInfoBanner Component
 * Displays information about the current comparison (current vs previous panel)
 */

import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Info, Calendar, Clock } from 'lucide-react';
import type { HealthPanel } from '@/hooks/health-metrics/useHealthPanelComparison';

interface ComparisonInfoBannerProps {
  currentPanel: HealthPanel | null;
  previousPanel: HealthPanel | null;
  hasComparison: boolean;
  timeDifference: {
    days: number;
    months: number;
    formatted: string;
  } | null;
}

export function ComparisonInfoBanner({
  currentPanel,
  previousPanel,
  hasComparison,
  timeDifference
}: ComparisonInfoBannerProps) {
  if (!currentPanel) {
    return null;
  }

  const currentDate = format(new Date(currentPanel.measuredAt), 'dd/MM/yyyy', { locale: vi });

  // Case 1: Has comparison
  if (hasComparison && previousPanel && timeDifference) {
    const previousDate = format(new Date(previousPanel.measuredAt), 'dd/MM/yyyy', { locale: vi });

    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-blue-900">Đang so sánh kết quả xét nghiệm</h3>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-700 font-medium">Đang xem:</span>
                <span className="text-blue-900 font-semibold">{currentDate}</span>
                <span className="text-blue-600">(Mới nhất)</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-700 font-medium">So sánh với:</span>
                <span className="text-blue-900 font-semibold">{previousDate}</span>
              </div>

              <div className="flex items-center gap-2 text-sm mt-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700">
                  Khoảng cách: <span className="font-medium">{timeDifference.formatted}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: No comparison (first test)
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1">Lần xét nghiệm đầu tiên</h3>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-700 font-medium">Ngày xét nghiệm:</span>
              <span className="text-amber-900 font-semibold">{currentDate}</span>
            </div>

            <p className="text-sm text-amber-700 mt-2">
              Đây là lần xét nghiệm đầu tiên trong hệ thống. Chưa có dữ liệu trước đó để so sánh xu hướng.
              Vui lòng tiếp tục nhập kết quả xét nghiệm định kỳ để theo dõi sự thay đổi các chỉ số.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

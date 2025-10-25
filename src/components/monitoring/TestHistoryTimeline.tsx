/**
 * TestHistoryTimeline Component
 * Timeline selector for navigating between test history panels
 */

import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HealthPanel } from '@/hooks/health-metrics/useHealthPanelComparison';

interface TestHistoryTimelineProps {
  panels: HealthPanel[];
  selectedPanelId: string | null;
  onPanelSelect: (panelId: string) => void;
}

export function TestHistoryTimeline({
  panels,
  selectedPanelId,
  onPanelSelect
}: TestHistoryTimelineProps) {
  if (panels.length === 0) {
    return null;
  }

  // Find current panel index
  const currentIndex = selectedPanelId
    ? panels.findIndex(p => p.id === selectedPanelId)
    : 0;

  const currentPanel = panels[currentIndex] || panels[0];
  const hasNext = currentIndex > 0; // Newer
  const hasPrevious = currentIndex < panels.length - 1; // Older

  const handleNext = () => {
    if (hasNext) {
      onPanelSelect(panels[currentIndex - 1].id);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onPanelSelect(panels[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Chọn thời điểm xem</h3>

      {/* Timeline visualization */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          {panels.slice(0, Math.min(5, panels.length)).map((panel, index) => {
            const isSelected = panel.id === currentPanel.id;
            const isComparing = index === currentIndex + 1; // Next panel is comparison

            return (
              <button
                key={panel.id}
                onClick={() => onPanelSelect(panel.id)}
                className="flex flex-col items-center group relative"
                title={`Xét nghiệm ngày ${format(new Date(panel.measuredAt), 'dd/MM/yyyy', { locale: vi })}`}
              >
                {/* Dot */}
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 transition-all z-10
                    ${isSelected
                      ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100'
                      : isComparing
                      ? 'bg-gray-400 border-gray-400 ring-2 ring-gray-100'
                      : 'bg-white border-gray-300 group-hover:border-blue-400'
                    }
                  `}
                />

                {/* Label */}
                <div className="mt-2 text-xs text-center">
                  <div className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                    {format(new Date(panel.measuredAt), 'dd/MM', { locale: vi })}
                  </div>
                  {isSelected && (
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      Đang xem
                    </div>
                  )}
                  {isComparing && !isSelected && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      So sánh
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {index < Math.min(4, panels.length - 1) && (
                  <div className="absolute top-2 left-6 w-full h-0.5 bg-gray-300" style={{ width: 'calc(100% - 1.5rem)' }} />
                )}
              </button>
            );
          })}

          {panels.length > 5 && (
            <div className="text-xs text-gray-500 ml-2">
              +{panels.length - 5} xét nghiệm
            </div>
          )}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
            ${hasPrevious
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          Cũ hơn
        </button>

        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {format(new Date(currentPanel.measuredAt), 'dd MMMM yyyy', { locale: vi })}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {currentIndex + 1}/{panels.length} xét nghiệm
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
            ${hasNext
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Mới hơn
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

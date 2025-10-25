/**
 * Interactive Legend for Health Metrics Chart
 * Allows users to toggle visibility of each metric
 */

import React from 'react';
import { getMetricConfig, PRIORITY_METRICS } from '@/lib/charts/metricThresholds';

interface InteractiveLegendProps {
  metrics: string[];
  selectedMetrics: string[];
  onMetricToggle: (metricKey: string) => void;
  hasComparison: boolean;
}

export function InteractiveLegend({
  metrics,
  selectedMetrics,
  onMetricToggle,
  hasComparison
}: InteractiveLegendProps) {
  // Group metrics: priority first, then others
  const priorityMetrics = metrics.filter(m => PRIORITY_METRICS.includes(m));
  const otherMetrics = metrics.filter(m => !PRIORITY_METRICS.includes(m));

  const renderMetricButton = (metricKey: string) => {
    const config = getMetricConfig(metricKey);
    if (!config) return null;

    const isSelected = selectedMetrics.includes(metricKey);
    const isPriority = PRIORITY_METRICS.includes(metricKey);

    return (
      <button
        key={metricKey}
        onClick={() => onMetricToggle(metricKey)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
          ${isSelected
            ? 'border-gray-300 bg-white shadow-sm'
            : 'border-gray-200 bg-gray-50 opacity-50 hover:opacity-70'
          }
        `}
        title={`${isSelected ? 'Ẩn' : 'Hiện'} ${config.displayName}`}
      >
        {/* Checkbox Indicator */}
        <div className={`
          w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
          ${isSelected ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-100'}
        `}>
          {isSelected && (
            <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Color Indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: isSelected ? config.color : '#9ca3af' }}
          />

          {/* Line Style Indicators */}
          <div className="flex flex-col gap-0.5">
            <div
              className="h-0.5 w-6"
              style={{
                backgroundColor: isSelected ? config.color : '#9ca3af',
                opacity: isSelected ? 1 : 0.5
              }}
            />
            {hasComparison && (
              <div
                className="h-0.5 w-6 opacity-40"
                style={{
                  backgroundColor: isSelected ? config.color : '#9ca3af',
                  borderTop: `2px dashed ${isSelected ? config.color : '#9ca3af'}`
                }}
              />
            )}
          </div>
        </div>

        {/* Metric Name */}
        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
          {config.displayName}
        </span>

        {/* Unit */}
        <span className={`text-xs ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
          ({config.unit || 'N/A'})
        </span>

        {/* Priority Badge */}
        {isPriority && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
            Ưu tiên
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Chọn chỉ số hiển thị</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{selectedMetrics.length}/{metrics.length} chỉ số</span>
          {hasComparison && (
            <div className="flex items-center gap-1.5 ml-3">
              <div className="h-0.5 w-4 bg-gray-600" />
              <span>Hiện tại</span>
              <div className="h-0.5 w-4 bg-gray-400 border-t-2 border-dashed border-gray-400" />
              <span>So sánh</span>
            </div>
          )}
        </div>
      </div>

      {/* Priority Metrics */}
      {priorityMetrics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Chỉ số quan trọng (Bệnh suy thận)</p>
          <div className="flex flex-wrap gap-2">
            {priorityMetrics.map(renderMetricButton)}
          </div>
        </div>
      )}

      {/* Other Metrics */}
      {otherMetrics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Các chỉ số khác</p>
          <div className="flex flex-wrap gap-2">
            {otherMetrics.map(renderMetricButton)}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={() => metrics.forEach(m => {
            if (!selectedMetrics.includes(m)) onMetricToggle(m);
          })}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Chọn tất cả
        </button>
        <span className="text-gray-400">•</span>
        <button
          onClick={() => {
            // Deselect all non-priority metrics
            selectedMetrics.forEach(m => {
              if (!PRIORITY_METRICS.includes(m)) onMetricToggle(m);
            });
          }}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Chỉ chỉ số ưu tiên
        </button>
        <span className="text-gray-400">•</span>
        <button
          onClick={() => selectedMetrics.forEach(m => onMetricToggle(m))}
          className="text-xs text-gray-600 hover:text-gray-700 font-medium"
        >
          Bỏ chọn tất cả
        </button>
      </div>
    </div>
  );
}

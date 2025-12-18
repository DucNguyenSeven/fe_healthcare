/**
 * Custom Tooltip for Health Metrics Chart
 * Displays metric values with alert levels and comparison data
 */

import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getMetricConfig } from '@/lib/charts/metricThresholds';
import type { KidneyHealthLevel } from '@/types/dashboard';

interface TooltipPayload {
  name: string;
  value: number;
  dataKey: string;
  color: string;
  payload: any;
}

interface HealthMetricsTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  selectedMetrics: string[];
  hasComparison: boolean;
}

const getAlertBadgeStyle = (level: KidneyHealthLevel) => {
  switch (level) {
    case 'NORMAL':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DANGER':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getAlertLabel = (level: KidneyHealthLevel) => {
  switch (level) {
    case 'NORMAL':
      return 'Bình thường';
    case 'WARNING':
      return 'Cảnh báo';
    case 'DANGER':
      return 'Nguy hiểm';
    case 'CRITICAL':
      return 'Rất nguy hiểm';
    default:
      return '';
  }
};

export function HealthMetricsTooltip({
  active,
  payload,
  label,
  selectedMetrics,
  hasComparison
}: HealthMetricsTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Parse date label
  let dateLabel = label;
  try {
    if (label) {
      const date = new Date(label);
      dateLabel = format(date, 'dd/MM/yyyy', { locale: vi });
    }
  } catch {
    // Keep original label if parsing fails
  }

  // Group payload by metric (current vs previous)
  const metricGroups = new Map<string, { current?: TooltipPayload; previous?: TooltipPayload }>();

  payload.forEach(item => {
    const isPrevious = item.dataKey.endsWith('_prev');
    const metricKey = isPrevious ? item.dataKey.replace('_prev', '') : item.dataKey;

    if (!metricGroups.has(metricKey)) {
      metricGroups.set(metricKey, {});
    }

    const group = metricGroups.get(metricKey)!;
    if (isPrevious) {
      group.previous = item;
    } else {
      group.current = item;
    }
  });

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4 max-w-sm">
      {/* Date Header */}
      <div className="mb-3 pb-2 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{dateLabel}</p>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {Array.from(metricGroups.entries()).map(([metricKey, group]) => {
          if (!selectedMetrics.includes(metricKey)) return null;

          const config = getMetricConfig(metricKey);
          if (!config) return null;

          const currentItem = group.current;
          const previousItem = group.previous;

          if (!currentItem) return null;

          // Get alert level from payload
          const alertLevel = currentItem.payload[`${metricKey}Alert`] as KidneyHealthLevel;

          // Calculate change if comparison exists
          let changePercent: number | null = null;
          if (hasComparison && previousItem && previousItem.value) {
            changePercent = ((currentItem.value - previousItem.value) / previousItem.value) * 100;
          }

          return (
            <div key={metricKey} className="space-y-1.5">
              {/* Metric Name */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium text-gray-900">
                  {config.displayName}
                </span>
              </div>

              {/* Current Value */}
              <div className="flex items-center justify-between gap-2 ml-5">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {currentItem.value}
                  </span>
                  <span className="text-xs text-gray-500">{config.unit}</span>
                </div>

                {/* Alert Badge */}
                {alertLevel && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getAlertBadgeStyle(alertLevel)}`}>
                    {getAlertLabel(alertLevel)}
                  </span>
                )}
              </div>

              {/* Comparison Info */}
              {hasComparison && previousItem && (
                <div className="ml-5 text-xs text-gray-600 flex items-center gap-1.5">
                  <span>So với trước:</span>
                  <span className="font-medium">{previousItem.value} {config.unit}</span>
                  {changePercent !== null && (
                    <span className={`font-semibold ${
                      changePercent > 0 ? 'text-red-600' : changePercent < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

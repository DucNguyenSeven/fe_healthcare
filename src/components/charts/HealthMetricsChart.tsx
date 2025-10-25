/**
 * Main Health Metrics Chart Component
 * Line chart with reference areas, dual-line comparison support, and interactive features
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HealthMetricsTooltip } from './HealthMetricsTooltip';
import { getMetricConfig, getMetricThreshold } from '@/lib/charts/metricThresholds';

export interface ChartDataPoint {
  date: string; // ISO date string
  timestamp: number; // Unix timestamp for sorting
  [key: string]: any; // Dynamic metric values (e.g., gfr: 45, serum_creatinine: 2.1)
}

interface HealthMetricsChartProps {
  data: ChartDataPoint[];
  comparisonData?: ChartDataPoint[]; // Previous period data for comparison
  selectedMetrics: string[];
  hasComparison: boolean;
  height?: number;
}

export function HealthMetricsChart({
  data,
  comparisonData,
  selectedMetrics,
  hasComparison,
  height = 400
}: HealthMetricsChartProps) {
  // Merge data with comparison data
  const mergedData = useMemo(() => {
    if (!hasComparison || !comparisonData || comparisonData.length === 0) {
      return data;
    }

    // Create a map of comparison data by date
    const comparisonMap = new Map(
      comparisonData.map(item => [item.date, item])
    );

    // Merge: add _prev suffix to comparison metrics
    return data.map(item => {
      const comparisonItem = comparisonMap.get(item.date);
      const merged = { ...item };

      if (comparisonItem) {
        selectedMetrics.forEach(metricKey => {
          if (comparisonItem[metricKey] !== undefined) {
            merged[`${metricKey}_prev`] = comparisonItem[metricKey];
            // Also copy alert level
            if (comparisonItem[`${metricKey}Alert`]) {
              merged[`${metricKey}Alert_prev`] = comparisonItem[`${metricKey}Alert`];
            }
          }
        });
      }

      return merged;
    });
  }, [data, comparisonData, hasComparison, selectedMetrics]);

  // Format X-axis date
  const formatXAxis = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'dd/MM', { locale: vi });
    } catch {
      return '';
    }
  };

  // Calculate Y-axis domain for selected metric
  const getYAxisDomain = (metricKey: string): [number, number] | undefined => {
    const threshold = getMetricThreshold(metricKey);
    if (!threshold || threshold.zones.length === 0) return undefined;

    // Get min/max from zones
    const allZones = threshold.zones;
    const minZone = Math.min(...allZones.map(z => z.min || 0));
    const maxZone = Math.max(...allZones.map(z => z.max || 0));

    // Add padding
    const padding = (maxZone - minZone) * 0.1;
    return [minZone - padding, maxZone + padding];
  };

  // Get primary metric for Y-axis (first selected metric)
  const primaryMetric = selectedMetrics[0];
  const yAxisDomain = primaryMetric ? getYAxisDomain(primaryMetric) : undefined;

  // Render reference areas for primary metric
  const renderReferenceAreas = () => {
    if (!primaryMetric) return null;

    const threshold = getMetricThreshold(primaryMetric);
    if (!threshold) return null;

    return threshold.zones.map((zone, index) => (
      <ReferenceArea
        key={`${primaryMetric}-zone-${index}`}
        y1={zone.min}
        y2={zone.max}
        fill={zone.fillColor}
        fillOpacity={0.3}
        ifOverflow="extendDomain"
      />
    ));
  };

  // Check if we have any data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-medium">Chưa có dữ liệu</p>
          <p className="text-sm mt-1">Vui lòng nhập kết quả xét nghiệm để xem biểu đồ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={mergedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X Axis - Date */}
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />

          {/* Y Axis */}
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            domain={yAxisDomain}
          />

          {/* Tooltip */}
          <Tooltip
            content={
              <HealthMetricsTooltip
                selectedMetrics={selectedMetrics}
                hasComparison={hasComparison}
              />
            }
            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '5 5' }}
          />

          {/* Legend (basic - we have custom one below) */}
          <Legend wrapperStyle={{ display: 'none' }} />

          {/* Reference Areas (zones) */}
          {renderReferenceAreas()}

          {/* Lines for each selected metric */}
          {selectedMetrics.map(metricKey => {
            const config = getMetricConfig(metricKey);
            if (!config) return null;

            return (
              <React.Fragment key={metricKey}>
                {/* Current Period Line (solid) */}
                <Line
                  type="monotone"
                  dataKey={metricKey}
                  stroke={config.color}
                  strokeWidth={2.5}
                  dot={{
                    fill: config.color,
                    strokeWidth: 2,
                    r: 4,
                    stroke: '#fff'
                  }}
                  activeDot={{
                    r: 6,
                    fill: config.color,
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                  name={config.displayName}
                  connectNulls
                />

                {/* Previous Period Line (dashed) - if comparison exists */}
                {hasComparison && (
                  <Line
                    type="monotone"
                    dataKey={`${metricKey}_prev`}
                    stroke={config.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{
                      fill: '#fff',
                      strokeWidth: 2,
                      r: 3,
                      stroke: config.color,
                      opacity: 0.6
                    }}
                    activeDot={{
                      r: 5,
                      fill: '#fff',
                      stroke: config.color,
                      strokeWidth: 2,
                      opacity: 0.8
                    }}
                    name={`${config.displayName} (So sánh)`}
                    opacity={0.5}
                    connectNulls
                  />
                )}
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Safe Zone Indicator */}
      {primaryMetric && (
        <div className="mt-4 flex items-center space-x-4 text-xs">
          <span className="font-medium text-gray-700">Vùng cảnh báo:</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-gray-600">Bình thường</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span className="text-gray-600">Cảnh báo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-200 rounded"></div>
            <span className="text-gray-600">Nguy hiểm</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-gray-600">Rất nguy hiểm</span>
          </div>
        </div>
      )}
    </div>
  );
}

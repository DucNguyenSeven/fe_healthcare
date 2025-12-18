/**
 * Main Health Metrics Chart Component
 * Line chart with dual-line comparison support and interactive features
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
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HealthMetricsTooltip } from './HealthMetricsTooltip';

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

          {/* X Axis - Date - FIXED: Use 'date' instead of 'timestamp' */}
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              try {
                return format(new Date(date), 'dd/MM', { locale: vi });
              } catch {
                return '';
              }
            }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
          />

          {/* Y Axis */}
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
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

          {/* Legend */}
          <Legend wrapperStyle={{ display: 'none' }} />

          {/* Lines - hardcoded but with conditional rendering based on selectedMetrics */}
          {selectedMetrics.includes('gfr') && (
            <Line 
              type="monotone" 
              dataKey="gfr" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#3b82f6" }}
              name="eGFR"
            />
          )}
          {selectedMetrics.includes('serum_creatinine') && (
            <Line 
              type="monotone" 
              dataKey="serum_creatinine" 
              stroke="#ef4444" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#ef4444" }}
              name="Creatinine"
            />
          )}
          {selectedMetrics.includes('bun') && (
            <Line 
              type="monotone" 
              dataKey="bun" 
              stroke="#f97316" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#f97316" }}
              name="BUN"
            />
          )}
          {selectedMetrics.includes('serum_calcium') && (
            <Line 
              type="monotone" 
              dataKey="serum_calcium" 
              stroke="#a855f7" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#a855f7" }}
              name="Canxi"
            />
          )}
          {selectedMetrics.includes('ana') && (
            <Line 
              type="monotone" 
              dataKey="ana" 
              stroke="#ec4899" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#ec4899" }}
              name="ANA"
            />
          )}
          {selectedMetrics.includes('c3_c4') && (
            <Line 
              type="monotone" 
              dataKey="c3_c4" 
              stroke="#14b8a6" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#14b8a6" }}
              name="Bổ thể C3/C4"
            />
          )}
          {selectedMetrics.includes('hematuria') && (
            <Line 
              type="monotone" 
              dataKey="hematuria" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#f59e0b" }}
              name="Đái máu"
            />
          )}
          {selectedMetrics.includes('oxalate_levels') && (
            <Line 
              type="monotone" 
              dataKey="oxalate_levels" 
              stroke="#6366f1" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#6366f1" }}
              name="Nồng độ Oxalat"
            />
          )}
          {selectedMetrics.includes('urine_ph') && (
            <Line 
              type="monotone" 
              dataKey="urine_ph" 
              stroke="#84cc16" 
              strokeWidth={3} 
              isAnimationActive={false}
              dot={{ r: 4, fill: "#84cc16" }}
              name="pH nước tiểu"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

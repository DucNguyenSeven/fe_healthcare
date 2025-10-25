/**
 * TrendAnalysisTable Component
 * Table showing metric-by-metric comparison with trends
 */

import React from 'react';
import { ArrowUp, ArrowDown, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import type { MetricChange } from '@/lib/health-assessment/metricChangeCalculator';

interface TrendAnalysisTableProps {
  metricChanges: MetricChange[];
  hasComparison: boolean;
}

const getAlertBadgeStyle = (level: string) => {
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

const getTrendIcon = (change: MetricChange) => {
  if (change.changeDirection === 'stable') {
    return <Minus className="w-4 h-4 text-gray-400" />;
  }

  if (change.changeDirection === 'up') {
    return change.severity === 'good' ? (
      <ArrowUp className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowUp className="w-4 h-4 text-red-600" />
    );
  }

  // Down
  return change.severity === 'good' ? (
    <ArrowDown className="w-4 h-4 text-green-600" />
  ) : (
    <ArrowDown className="w-4 h-4 text-red-600" />
  );
};

const getTrendLabel = (change: MetricChange) => {
  if (change.trendStatus === 'improved') {
    return { icon: CheckCircle, text: 'Cải thiện', color: 'text-green-700 bg-green-50' };
  }
  if (change.trendStatus === 'worsened') {
    return { icon: AlertCircle, text: 'Xấu đi', color: 'text-red-700 bg-red-50' };
  }
  return { icon: Minus, text: 'Ổn định', color: 'text-gray-600 bg-gray-50' };
};

export function TrendAnalysisTable({ metricChanges, hasComparison }: TrendAnalysisTableProps) {
  if (metricChanges.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Phân tích xu hướng</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Không có dữ liệu để phân tích</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📈 Phân tích thay đổi chỉ số
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Chỉ số</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Trước</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Hiện tại</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Thay đổi</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Xu hướng</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {metricChanges.map((change, index) => {
              const trend = getTrendLabel(change);
              const TrendIcon = trend.icon;

              return (
                <tr
                  key={change.metricName}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Metric Name */}
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{change.displayName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{change.unit}</div>
                  </td>

                  {/* Previous Value */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-gray-900">{change.previousValue}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getAlertBadgeStyle(change.previousAlert.level)}`}>
                        {change.previousAlert.label}
                      </span>
                    </div>
                  </td>

                  {/* Current Value */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-gray-900">{change.currentValue}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getAlertBadgeStyle(change.currentAlert.level)}`}>
                        {change.currentAlert.label}
                      </span>
                    </div>
                  </td>

                  {/* Change */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {getTrendIcon(change)}
                      <span className={`font-semibold ${
                        change.severity === 'good' ? 'text-green-700' :
                        change.severity === 'bad' ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {change.changeDirection === 'up' ? '+' : change.changeDirection === 'down' ? '' : '±'}
                        {Math.abs(change.changePercentage).toFixed(1)}%
                      </span>
                    </div>
                    {change.alertLevelChanged && (
                      <div className="text-xs text-orange-600 mt-1 font-medium">
                        Mức cảnh báo thay đổi
                      </div>
                    )}
                  </td>

                  {/* Trend Status */}
                  <td className="py-4 px-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${trend.color}`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{trend.text}</span>
                    </div>
                  </td>

                  {/* Interpretation */}
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700">{change.interpretation}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">
              Cải thiện: <span className="font-semibold text-green-700">
                {metricChanges.filter(c => c.trendStatus === 'improved').length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">
              Xấu đi: <span className="font-semibold text-red-700">
                {metricChanges.filter(c => c.trendStatus === 'worsened').length}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Ổn định: <span className="font-semibold text-gray-700">
                {metricChanges.filter(c => c.trendStatus === 'stable').length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

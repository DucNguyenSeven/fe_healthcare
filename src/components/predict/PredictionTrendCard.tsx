/**
 * PredictionTrendCard Component
 * Displays trend comparison between current and previous CKD predictions
 */

import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, AlertCircle, CheckCircle, Minus } from 'lucide-react';
import type { PredictCurrentTrendsResponse, TrendClassification, MetricComparisonStatus } from '@/types/predict';

interface PredictionTrendCardProps {
  trendData: PredictCurrentTrendsResponse;
}

/**
 * Get color classes for trend classification
 */
function getTrendColorClasses(classification: TrendClassification) {
  switch (classification) {
    case 'IMPROVING':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800'
      };
    case 'WORSENING':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800'
      };
    case 'STABLE':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800'
      };
  }
}

/**
 * Get icon component for trend classification
 */
function getTrendIcon(classification: TrendClassification, iconClass: string) {
  switch (classification) {
    case 'IMPROVING':
      return <TrendingUp className={`w-6 h-6 ${iconClass}`} />;
    case 'WORSENING':
      return <TrendingDown className={`w-6 h-6 ${iconClass}`} />;
    case 'STABLE':
      return <ArrowRight className={`w-6 h-6 ${iconClass}`} />;
    default:
      return <Minus className={`w-6 h-6 ${iconClass}`} />;
  }
}

/**
 * Get Vietnamese label for trend classification
 */
function getTrendLabel(classification: TrendClassification): string {
  switch (classification) {
    case 'IMPROVING':
      return 'Cải thiện';
    case 'WORSENING':
      return 'Xấu đi';
    case 'STABLE':
      return 'Ổn định';
    case 'INSUFFICIENT_HISTORY':
      return 'Chưa đủ dữ liệu';
    default:
      return 'Không xác định';
  }
}

/**
 * Get color classes for metric comparison status
 */
function getMetricStatusClasses(status: MetricComparisonStatus) {
  switch (status) {
    case 'IMPROVING':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'WARNING':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-800 border-red-200'
      };
    case 'NORMAL':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-800 border-gray-200'
      };
  }
}

/**
 * Get icon for metric status
 */
function getMetricStatusIcon(status: MetricComparisonStatus, iconClass: string) {
  switch (status) {
    case 'IMPROVING':
      return <CheckCircle className={`w-4 h-4 ${iconClass}`} />;
    case 'WARNING':
      return <AlertCircle className={`w-4 h-4 ${iconClass}`} />;
    case 'NORMAL':
      return <Minus className={`w-4 h-4 ${iconClass}`} />;
    default:
      return <Minus className={`w-4 h-4 ${iconClass}`} />;
  }
}

/**
 * Get Vietnamese label for metric status
 */
function getMetricStatusLabel(status: MetricComparisonStatus): string {
  switch (status) {
    case 'IMPROVING':
      return 'Cải thiện';
    case 'WARNING':
      return 'Cảnh báo';
    case 'NORMAL':
      return 'Bình thường';
    default:
      return 'N/A';
  }
}

export function PredictionTrendCard({ trendData }: PredictionTrendCardProps) {
  const { trend, metricComparisons = [] } = trendData;
  const colors = getTrendColorClasses(trend.classification);

  return (
    <div className="space-y-4 mt-6">
      {/* Trend Overview Banner */}
      <div className={`p-4 rounded-xl border-2 ${colors.bg} ${colors.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
            {getTrendIcon(trend.classification, colors.icon)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-lg font-bold ${colors.text}`}>
                So sánh với lần dự đoán trước
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                {getTrendLabel(trend.classification)}
              </span>
            </div>

            {/* Stage Comparison */}
            <div className="mb-3">
              {trend.stagePrevious !== null && trend.stageCurrent !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-medium ${colors.text}`}>Giai đoạn:</span>
                  <span className="font-semibold text-gray-900">
                    Stage {trend.stagePrevious} → Stage {trend.stageCurrent}
                  </span>
                </div>
              )}

              {/* Removed: Confidence change display - values too small (scientific notation ~0.0%) */}
            </div>

            {/* Summary */}
            <p className={`text-sm ${colors.text} leading-relaxed`}>
              {trend.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Comparisons Table */}
      {metricComparisons.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Chi tiết thay đổi các chỉ số</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Chỉ số</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Trước</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Hiện tại</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Thay đổi</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {metricComparisons.map((comparison, index) => {
                  const statusColors = getMetricStatusClasses(comparison.status);

                  return (
                    <tr
                      key={comparison.metric}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === 0 ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Metric Name */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{comparison.metric}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{comparison.unit}</div>
                      </td>

                      {/* Previous Value */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-gray-700">
                          {comparison.previousValue.toFixed(2)}
                        </span>
                      </td>

                      {/* Current Value */}
                      <td className="py-4 px-4 text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {comparison.currentValue.toFixed(2)}
                        </span>
                      </td>

                      {/* Change Percentage */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {comparison.changePct > 0 ? (
                            <TrendingUp className={`w-4 h-4 ${statusColors.icon}`} />
                          ) : comparison.changePct < 0 ? (
                            <TrendingDown className={`w-4 h-4 ${statusColors.icon}`} />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`font-semibold ${statusColors.text}`}>
                            {comparison.changePct > 0 ? '+' : ''}
                            {comparison.changePct.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusColors.badge}`}>
                          {getMetricStatusIcon(comparison.status, statusColors.icon)}
                          <span className="text-sm font-medium">
                            {getMetricStatusLabel(comparison.status)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Message/Interpretation Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              {metricComparisons.map((comparison, index) => (
                <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>
                    <span className="font-semibold">{comparison.metric}:</span> {comparison.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">
                Cải thiện: <span className="font-semibold text-green-700">
                  {metricComparisons.filter(c => c.status === 'IMPROVING').length}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">
                Cảnh báo: <span className="font-semibold text-red-700">
                  {metricComparisons.filter(c => c.status === 'WARNING').length}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Bình thường: <span className="font-semibold text-gray-700">
                  {metricComparisons.filter(c => c.status === 'NORMAL').length}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

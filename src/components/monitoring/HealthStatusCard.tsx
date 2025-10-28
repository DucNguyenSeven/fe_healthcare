/**
 * HealthStatusCard Component
 * Displays overall health status assessment with recommendations
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp, Calendar, MessageCircle } from 'lucide-react';
import type { HealthStatusAssessment } from '@/lib/health-assessment/healthAssessment';
import { getUrgencyDescription } from '@/lib/health-assessment/recommendations';

interface HealthStatusCardProps {
  assessment: HealthStatusAssessment | null;
  onBookAppointment?: () => void;
  onAIConsult?: () => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        titleColor: 'text-red-900',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100'
      };
    case 'declining':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        titleColor: 'text-orange-900',
        icon: TrendingDown,
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-100'
      };
    case 'improving':
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        titleColor: 'text-green-900',
        icon: TrendingUp,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100'
      };
    case 'stable':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        titleColor: 'text-blue-900',
        icon: CheckCircle,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
      };
    case 'first_test':
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        titleColor: 'text-gray-900',
        icon: Info,
        iconColor: 'text-gray-600',
        iconBg: 'bg-gray-100'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        titleColor: 'text-gray-900',
        icon: Info,
        iconColor: 'text-gray-600',
        iconBg: 'bg-gray-100'
      };
  }
};

const getStatusTitle = (status: string) => {
  switch (status) {
    case 'critical':
      return 'NGUY CẤP: Cần can thiệp y tế ngay';
    case 'declining':
      return 'CẢNH BÁO: Tình trạng đang xấu đi';
    case 'improving':
      return 'TÍCH CỰC: Tình trạng đang cải thiện';
    case 'stable':
      return 'ỔN ĐỊNH: Tiếp tục duy trì';
    case 'first_test':
      return 'KẾT QUẢ XÉT NGHIỆM ĐẦU TIÊN';
    default:
      return 'ĐÁNH GIÁ TÌNH TRẠNG BỆNH';
  }
};

export function HealthStatusCard({
  assessment,
  onBookAppointment,
  onAIConsult
}: HealthStatusCardProps) {
  if (!assessment) {
    return null;
  }

  const style = getStatusStyle(assessment.overallStatus);
  const StatusIcon = style.icon;

  return (
    <div className={`rounded-2xl border-2 ${style.border} ${style.bg} p-6 shadow-sm`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <StatusIcon className={`w-6 h-6 ${style.iconColor}`} />
        </div>

        <div className="flex-1">
          <h2 className={`text-xl font-bold ${style.titleColor} mb-1`}>
            {getStatusTitle(assessment.overallStatus)}
          </h2>

          {assessment.shouldSeeDoctor && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Mức độ: {getUrgencyDescription(assessment.urgency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed">{assessment.summary}</p>
      </div>

      {/* Key Findings */}
      {assessment.keyFindings.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">📊 Phân tích chi tiết:</h3>
          <ul className="space-y-1.5">
            {assessment.keyFindings.map((finding, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {assessment.concerns.length > 0 && (
        <div className="mb-4 p-3 bg-white/50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            Điểm cần lưu ý:
          </h3>
          <ul className="space-y-1.5">
            {assessment.concerns.map((concern, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {assessment.recommendations.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">💡 Khuyến nghị:</h3>
          <div className="space-y-2">
            {assessment.recommendations.slice(0, 4).map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : rec.priority === 'medium'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">{rec.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-0.5">{rec.title}</p>
                    <p className="text-xs text-gray-700">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
        {onBookAppointment && assessment.shouldSeeDoctor && (
          <button
            onClick={onBookAppointment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Calendar className="w-4 h-4" />
            Đặt lịch khám
          </button>
        )}

        {onAIConsult && (
          <button
            onClick={onAIConsult}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Tư vấn với AI
          </button>
        )}
      </div>
    </div>
  );
}

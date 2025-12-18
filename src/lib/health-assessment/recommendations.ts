/**
 * Recommendations Generator
 * Generate personalized health recommendations based on metric changes and status
 */

import type { KidneyHealthLevel } from '@/types/dashboard';
import type { MetricChange } from './metricChangeCalculator';

export interface Recommendation {
  category: 'medical' | 'lifestyle' | 'diet' | 'monitoring';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
}

/**
 * Generate recommendations based on overall status and metric changes
 */
export function generateRecommendations(
  overallStatus: 'improving' | 'stable' | 'declining' | 'critical' | 'first_test',
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high',
  metricChanges: MetricChange[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Medical Recommendations
  if (overallStatus === 'critical' || riskLevel === 'very_high') {
    recommendations.push({
      category: 'medical',
      priority: 'high',
      icon: '🏥',
      title: 'Đặt lịch khám gấp',
      description: 'Các chỉ số ở mức nguy hiểm. Vui lòng đặt lịch khám với bác sĩ chuyên khoa thận trong vòng 1-3 ngày.'
    });
  } else if (overallStatus === 'declining' || riskLevel === 'high') {
    recommendations.push({
      category: 'medical',
      priority: 'high',
      icon: '📅',
      title: 'Tái khám sớm',
      description: 'Tình trạng đang xấu đi. Đặt lịch tái khám với bác sĩ trong vòng 1 tuần để đánh giá và điều chỉnh phác đồ điều trị.'
    });
  } else if (overallStatus === 'first_test') {
    recommendations.push({
      category: 'medical',
      priority: 'medium',
      icon: '👨‍⚕️',
      title: 'Tái khám theo lịch',
      description: 'Hãy tái khám theo lịch hẹn với bác sĩ để được tư vấn về kết quả xét nghiệm và phương án điều trị.'
    });
  }

  // Check specific metric recommendations
  const egfrChange = metricChanges.find(c => c.metricName.toLowerCase().includes('gfr'));
  if (egfrChange) {
    if (egfrChange.currentValue < 30) {
      recommendations.push({
        category: 'medical',
        priority: 'high',
        icon: '⚠️',
        title: 'eGFR < 30: Suy thận nặng',
        description: 'Chức năng thận đã giảm nghiêm trọng (giai đoạn 4-5). Cần can thiệp y tế chuyên sâu và có thể cần chuẩn bị lọc máu.'
      });
    } else if (egfrChange.currentValue < 45) {
      recommendations.push({
        category: 'medical',
        priority: 'high',
        icon: '⚠️',
        title: 'eGFR < 45: Suy thận giai đoạn 3B',
        description: 'Chức năng thận giảm vừa đến nặng. Cần theo dõi chặt chẽ và tuân thủ nghiêm ngặt phác đồ điều trị.'
      });
    }

    if (egfrChange.trendStatus === 'worsened') {
      recommendations.push({
        category: 'lifestyle',
        priority: 'high',
        icon: '💧',
        title: 'Bảo vệ chức năng thận',
        description: 'Uống đủ nước (1.5-2L/ngày), tránh thuốc giảm đau không cần thiết, và hạn chế các chất gây hại thận.'
      });
    }
  }

  const creatinineChange = metricChanges.find(c => c.metricName.toLowerCase().includes('creatinine'));
  if (creatinineChange && creatinineChange.currentValue > 2.0) {
    recommendations.push({
      category: 'diet',
      priority: 'high',
      icon: '🥗',
      title: 'Chế độ ăn thận',
      description: 'Giảm lượng protein (0.8g/kg/ngày), hạn chế muối (<5g/ngày), tránh thực phẩm chế biến sẵn và đồ hộp.'
    });
  }

  // Lifestyle Recommendations
  if (overallStatus !== 'critical') {
    recommendations.push({
      category: 'lifestyle',
      priority: 'medium',
      icon: '🏃',
      title: 'Vận động nhẹ nhàng',
      description: 'Duy trì hoạt động thể chất nhẹ nhàng 30 phút/ngày (đi bộ, yoga) để cải thiện tuần hoàn và kiểm soát cân nặng.'
    });
  }

  // Diet Recommendations
  recommendations.push({
    category: 'diet',
    priority: 'medium',
    icon: '🍎',
    title: 'Chế độ ăn lành mạnh',
    description: 'Ăn nhiều rau xanh, trái cây tươi, ngũ cốc nguyên hạt. Hạn chế đường, muối, và chất béo bão hòa.'
  });

  // Monitoring Recommendations
  recommendations.push({
    category: 'monitoring',
    priority: 'medium',
    icon: '📊',
    title: 'Theo dõi định kỳ',
    description: 'Nhập kết quả xét nghiệm định kỳ để theo dõi xu hướng và phát hiện sớm các biến đổi bất thường.'
  });

  if (overallStatus === 'declining' || riskLevel === 'high') {
    recommendations.push({
      category: 'monitoring',
      priority: 'high',
      icon: '🩺',
      title: 'Đo huyết áp hàng ngày',
      description: 'Kiểm tra huyết áp mỗi ngày và ghi chép lại để theo dõi. Huyết áp cao có thể làm tổn thương thận thêm.'
    });
  }

  // Medication adherence
  if (overallStatus !== 'first_test') {
    recommendations.push({
      category: 'medical',
      priority: 'high',
      icon: '💊',
      title: 'Tuân thủ đơn thuốc',
      description: 'Uống thuốc đúng giờ, đúng liều lượng theo chỉ định của bác sĩ. Không tự ý thay đổi hoặc ngừng thuốc.'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top recommendations
  return recommendations.slice(0, 6);
}

/**
 * Get urgency level description
 */
export function getUrgencyDescription(urgency: 'routine' | 'soon' | 'urgent' | 'emergency'): string {
  switch (urgency) {
    case 'emergency':
      return 'CẦN GẤP - Trong vòng 24 giờ';
    case 'urgent':
      return 'KHẨN CẤP - Trong vòng 1-3 ngày';
    case 'soon':
      return 'SỚM - Trong vòng 1 tuần';
    case 'routine':
      return 'ĐỊNH KỲ - Trong vòng 1 tháng';
    default:
      return 'Theo lịch hẹn';
  }
}

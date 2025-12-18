/**
 * Health Assessment Algorithm
 * Rule-based algorithm for assessing overall health status based on metric changes
 */

import type { KidneyHealthLevel } from '@/types/dashboard';
import type { MetricChange } from './metricChangeCalculator';
import { getChangesSummary } from './metricChangeCalculator';
import { generateRecommendations, type Recommendation } from './recommendations';

export interface HealthStatusAssessment {
  overallStatus: 'improving' | 'stable' | 'declining' | 'critical' | 'first_test';
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  summary: string;
  keyFindings: string[];
  concerns: string[];
  recommendations: Recommendation[];
  shouldSeeDoctor: boolean;
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
}

/**
 * Generate health assessment with comparison data
 */
export function generateComparisonAssessment(
  currentMetrics: Record<string, { value: number | string; unit: string }>,
  previousMetrics: Record<string, { value: number | string; unit: string }>,
  metricChanges: MetricChange[]
): HealthStatusAssessment {
  // Get summary statistics
  const summary = getChangesSummary(metricChanges);

  // 1. Determine overall status
  let overallStatus: HealthStatusAssessment['overallStatus'];

  // Check for CRITICAL conditions
  const hasCriticalMetric = summary.critical > 0;

  if (hasCriticalMetric) {
    overallStatus = 'critical';
  } else if (summary.worsened >= 2) {
    // 2 or more metrics worsening
    overallStatus = 'declining';
  } else if (summary.improved >= 2 && summary.worsened === 0) {
    // 2 or more improved, none worsened
    overallStatus = 'improving';
  } else if (summary.worsened === 1) {
    // Only 1 metric worsening
    overallStatus = 'declining';
  } else {
    overallStatus = 'stable';
  }

  // 2. Calculate risk level
  let riskLevel: HealthStatusAssessment['riskLevel'];

  if (summary.critical >= 1 || summary.danger >= 3) {
    riskLevel = 'very_high';
  } else if (summary.danger >= 1 || summary.worsened >= 2) {
    riskLevel = 'high';
  } else if (summary.worsened >= 1 || summary.warning >= 2) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  // 3. Generate summary text
  const summaryText = generateSummaryText(overallStatus, summary);

  // 4. Extract key findings
  const keyFindings = metricChanges
    .filter(c => c.trendStatus !== 'stable' || c.alertLevelChanged)
    .slice(0, 5) // Top 5 findings
    .map(c => {
      const direction = c.changeDirection === 'up' ? 'tăng' : 'giảm';
      const emoji = c.severity === 'good' ? '✅' : c.severity === 'bad' ? '🔴' : '➡️';
      return `${emoji} ${c.displayName} ${direction} ${Math.abs(c.changePercentage).toFixed(1)}% (${c.previousValue}→${c.currentValue} ${c.unit})`;
    });

  // 5. Extract concerns
  const concerns = extractConcerns(metricChanges, summary);

  // 6. Generate recommendations
  const recommendations = generateRecommendations(overallStatus, riskLevel, metricChanges);

  // 7. Determine urgency
  let urgency: HealthStatusAssessment['urgency'];
  let shouldSeeDoctor: boolean;

  if (overallStatus === 'critical' || summary.critical >= 1) {
    urgency = 'urgent';
    shouldSeeDoctor = true;
  } else if (overallStatus === 'declining' || riskLevel === 'high') {
    urgency = 'soon';
    shouldSeeDoctor = true;
  } else if (summary.worsened >= 1 || riskLevel === 'moderate') {
    urgency = 'routine';
    shouldSeeDoctor = true;
  } else {
    urgency = 'routine';
    shouldSeeDoctor = false;
  }

  return {
    overallStatus,
    riskLevel,
    summary: summaryText,
    keyFindings,
    concerns,
    recommendations,
    shouldSeeDoctor,
    urgency
  };
}

/**
 * Generate health assessment for first test (no comparison)
 */
export function generateSinglePanelAssessment(
  metrics: Record<string, { value: number | string; unit: string }>
): HealthStatusAssessment {
  // Count alert levels
  let criticalCount = 0;
  let dangerCount = 0;
  let warningCount = 0;
  let normalCount = 0;

  const keyFindings: string[] = [];

  // Simple assessment based on current values only
  Object.entries(metrics).forEach(([key, metric]) => {
    const value = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
    if (isNaN(value)) return;

    // Get alert level (simplified)
    const metricName = key.toLowerCase();
    let alert: KidneyHealthLevel = 'NORMAL';

    if (metricName.includes('gfr')) {
      if (value < 30) alert = 'CRITICAL';
      else if (value < 60) alert = 'DANGER';
      else if (value < 90) alert = 'WARNING';
      else alert = 'NORMAL';

      keyFindings.push(`eGFR: ${value} ${metric.unit} (${getAlertLabel(alert)})`);
    } else if (metricName.includes('creatinine')) {
      if (value > 4.0) alert = 'CRITICAL';
      else if (value > 2.0) alert = 'DANGER';
      else if (value > 1.3) alert = 'WARNING';
      else alert = 'NORMAL';

      keyFindings.push(`Creatinine: ${value} ${metric.unit} (${getAlertLabel(alert)})`);
    } else if (metricName.includes('bun')) {
      if (value > 50) alert = 'CRITICAL';
      else if (value > 30) alert = 'DANGER';
      else if (value > 20) alert = 'WARNING';
      else if (value >= 7) alert = 'NORMAL';
      else alert = 'WARNING';

      keyFindings.push(`BUN: ${value} ${metric.unit} (${getAlertLabel(alert)})`);
    } else if (metricName.includes('calcium')) {
      if (value < 7.0 || value > 12.0) alert = 'CRITICAL';
      else if (value < 8.0 || value > 11.0) alert = 'DANGER';
      else if (value < 8.5 || value > 10.5) alert = 'WARNING';
      else alert = 'NORMAL';

      keyFindings.push(`Canxi: ${value} ${metric.unit} (${getAlertLabel(alert)})`);
    }

    // Count alerts
    if (alert === 'CRITICAL') criticalCount++;
    else if (alert === 'DANGER') dangerCount++;
    else if (alert === 'WARNING') warningCount++;
    else normalCount++;
  });

  // Determine status
  const overallStatus: HealthStatusAssessment['overallStatus'] = 'first_test';
  let riskLevel: HealthStatusAssessment['riskLevel'];

  if (criticalCount >= 1 || dangerCount >= 3) {
    riskLevel = 'very_high';
  } else if (dangerCount >= 1) {
    riskLevel = 'high';
  } else if (warningCount >= 2) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  const summary = 'Đây là lần xét nghiệm đầu tiên trong hệ thống. Chưa có dữ liệu trước đó để so sánh xu hướng.';

  const concerns: string[] = [];
  if (criticalCount > 0) {
    concerns.push(`${criticalCount} chỉ số ở mức RẤT NGUY HIỂM`);
  }
  if (dangerCount > 0) {
    concerns.push(`${dangerCount} chỉ số ở mức NGUY HIỂM`);
  }
  if (warningCount > 0) {
    concerns.push(`${warningCount} chỉ số cần theo dõi`);
  }

  const recommendations = generateRecommendations(overallStatus, riskLevel, []);

  return {
    overallStatus,
    riskLevel,
    summary,
    keyFindings: keyFindings.slice(0, 5),
    concerns,
    recommendations,
    shouldSeeDoctor: riskLevel !== 'low',
    urgency: riskLevel === 'very_high' ? 'urgent' : riskLevel === 'high' ? 'soon' : 'routine'
  };
}

// Helper functions

function generateSummaryText(
  status: 'improving' | 'stable' | 'declining' | 'critical' | 'first_test',
  summary: ReturnType<typeof getChangesSummary>
): string {
  if (status === 'critical') {
    return `Tình trạng NGUY CẤP: ${summary.critical} chỉ số ở mức rất nguy hiểm. Cần can thiệp y tế ngay lập tức.`;
  }

  if (status === 'declining') {
    return `Tình trạng đang XẤU ĐI: ${summary.worsened} chỉ số giảm, ${summary.improved} chỉ số cải thiện. Cần theo dõi chặt chẽ.`;
  }

  if (status === 'improving') {
    return `Tình trạng đang CẢI THIỆN: ${summary.improved} chỉ số tốt hơn, ${summary.worsened} chỉ số xấu đi. Tiếp tục duy trì điều trị.`;
  }

  if (status === 'stable') {
    return `Tình trạng ỔN ĐỊNH: ${summary.stable} chỉ số không thay đổi đáng kể. Tiếp tục theo dõi định kỳ.`;
  }

  return 'Đánh giá dựa trên lần xét nghiệm đầu tiên.';
}

function extractConcerns(
  metricChanges: MetricChange[],
  summary: ReturnType<typeof getChangesSummary>
): string[] {
  const concerns: string[] = [];

  // Critical metrics
  const egfrChange = metricChanges.find(c => c.metricName.toLowerCase().includes('gfr'));
  if (egfrChange) {
    if (egfrChange.currentValue < 30) {
      concerns.push('⚠️ eGFR < 30: Nguy cơ suy thận giai đoạn 4-5 (Rất nặng)');
    } else if (egfrChange.currentValue < 45) {
      concerns.push('⚠️ eGFR < 45: Nguy cơ suy thận giai đoạn 3B (Nặng)');
    } else if (egfrChange.trendStatus === 'worsened') {
      concerns.push('⚠️ Chức năng thận đang giảm dần');
    }
  }

  // Creatinine
  const creatChange = metricChanges.find(c => c.metricName.toLowerCase().includes('creatinine'));
  if (creatChange) {
    if (creatChange.currentValue > 4.0) {
      concerns.push('🔴 Creatinine > 4.0: Mức độ rất cao, cần can thiệp');
    } else if (creatChange.currentValue > 2.0) {
      concerns.push('🟠 Creatinine > 2.0: Cần theo dõi chặt chẽ');
    }
  }

  // Multiple metrics worsening
  if (summary.worsened >= 2) {
    concerns.push(`📉 ${summary.worsened} chỉ số đang xấu đi đồng thời`);
  }

  // Alert level changes
  const alertIncreased = metricChanges.filter(c => c.alertLevelChanged && c.severity === 'bad');
  if (alertIncreased.length > 0) {
    concerns.push(`📊 ${alertIncreased.length} chỉ số chuyển sang mức cảnh báo cao hơn`);
  }

  return concerns.slice(0, 5); // Top 5 concerns
}

function getAlertLabel(level: KidneyHealthLevel): string {
  const labels = {
    NORMAL: 'Bình thường',
    WARNING: 'Cảnh báo',
    DANGER: 'Nguy hiểm',
    CRITICAL: 'Rất nguy hiểm'
  };
  return labels[level];
}

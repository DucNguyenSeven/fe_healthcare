/**
 * Metric Change Calculator
 * Rule-based logic for calculating metric changes and determining trends
 */

import type { KidneyHealthLevel } from '@/types/dashboard';
import {
  getEGFRAlert,
  getCreatinineAlert,
  getBUNAlert,
  getCalciumAlert,
  getBloodPressureAlert
} from '@/types/dashboard';
import { getMetricConfig } from '@/lib/charts/metricThresholds';

export interface MetricChange {
  metricName: string;
  displayName: string;
  unit: string;

  currentValue: number;
  previousValue: number;

  changeValue: number; // currentValue - previousValue
  changePercentage: number; // (change / previous) * 100
  changeDirection: 'up' | 'down' | 'stable';

  trendStatus: 'improved' | 'worsened' | 'stable';
  severity: 'good' | 'bad' | 'neutral';

  currentAlert: {
    level: KidneyHealthLevel;
    label: string;
  };
  previousAlert: {
    level: KidneyHealthLevel;
    label: string;
  };
  alertLevelChanged: boolean;

  interpretation: string; // Human-readable explanation
}

/**
 * Get alert for a specific metric
 */
function getMetricAlert(metricName: string, value: number): { level: KidneyHealthLevel; label: string } {
  const normalized = metricName.toLowerCase();

  if (normalized.includes('gfr') || normalized === 'egfr') {
    const alert = getEGFRAlert(value);
    return { level: alert.level, label: alert.label };
  }

  if (normalized.includes('creatinine')) {
    const alert = getCreatinineAlert(value);
    return { level: alert.level, label: alert.label };
  }

  if (normalized.includes('bun') || normalized.includes('ure')) {
    const alert = getBUNAlert(value);
    return { level: alert.level, label: alert.label };
  }

  if (normalized.includes('calcium') || normalized.includes('canxi')) {
    const alert = getCalciumAlert(value);
    return { level: alert.level, label: alert.label };
  }

  if (normalized.includes('blood_pressure') || normalized.includes('huyết áp')) {
    const alert = getBloodPressureAlert(value);
    return { level: alert.level, label: alert.label };
  }

  // Default
  return { level: 'NORMAL', label: 'Bình thường' };
}

/**
 * Determine trend status based on metric-specific rules
 */
function determineTrendStatus(
  metricName: string,
  changeDirection: 'up' | 'down' | 'stable',
  currentLevel: KidneyHealthLevel,
  previousLevel: KidneyHealthLevel
): 'improved' | 'worsened' | 'stable' {
  if (changeDirection === 'stable') return 'stable';

  // Rule 1: Check if alert level changed
  const levelOrder: Record<KidneyHealthLevel, number> = {
    NORMAL: 0,
    WARNING: 1,
    DANGER: 2,
    CRITICAL: 3
  };

  const currentScore = levelOrder[currentLevel];
  const previousScore = levelOrder[previousLevel];

  if (currentScore > previousScore) return 'worsened'; // Alert level increased
  if (currentScore < previousScore) return 'improved'; // Alert level decreased

  // Rule 2: Metric-specific logic (when alert level is same)
  const normalized = metricName.toLowerCase();

  // Metrics where INCREASE is BAD
  const increaseIsBad = [
    'creatinine', 'serum_creatinine',
    'bun', 'ure',
    'oxalate', 'oxalate_levels',
    'blood_pressure', 'huyết áp'
  ];

  // Metrics where DECREASE is BAD
  const decreaseIsBad = [
    'gfr', 'egfr',
    'hemoglobin',
    'albumin'
  ];

  // Metrics where both extremes are bad (Calcium)
  if (normalized.includes('calcium') || normalized.includes('canxi')) {
    // If already in WARNING/DANGER/CRITICAL, any movement away from NORMAL is bad
    if (currentLevel !== 'NORMAL') {
      return 'worsened'; // Moving further from normal range
    }
    return 'stable';
  }

  // Check increase is bad
  if (increaseIsBad.some(keyword => normalized.includes(keyword))) {
    return changeDirection === 'up' ? 'worsened' : 'improved';
  }

  // Check decrease is bad
  if (decreaseIsBad.some(keyword => normalized.includes(keyword))) {
    return changeDirection === 'down' ? 'worsened' : 'improved';
  }

  // Default: stable
  return 'stable';
}

/**
 * Generate human-readable interpretation
 */
function generateInterpretation(
  displayName: string,
  changePercentage: number,
  trendStatus: 'improved' | 'worsened' | 'stable',
  currentLevel: KidneyHealthLevel
): string {
  const absChange = Math.abs(changePercentage).toFixed(1);

  if (trendStatus === 'stable') {
    return `${displayName} ổn định`;
  }

  if (trendStatus === 'improved') {
    if (currentLevel === 'NORMAL') {
      return `${displayName} đã cải thiện và trở về mức bình thường`;
    }
    return `${displayName} cải thiện ${absChange}%`;
  }

  // Worsened
  if (currentLevel === 'CRITICAL') {
    return `${displayName} giảm nghiêm trọng ${absChange}% - Cần can thiệp ngay`;
  }
  if (currentLevel === 'DANGER') {
    return `${displayName} xấu đi ${absChange}% - Ở mức nguy hiểm`;
  }
  if (currentLevel === 'WARNING') {
    return `${displayName} xấu đi ${absChange}% - Cần theo dõi`;
  }

  return `${displayName} xấu đi ${absChange}%`;
}

/**
 * Calculate metric change between two values
 */
export function calculateMetricChange(
  metricName: string,
  currentValue: number,
  previousValue: number
): MetricChange {
  const config = getMetricConfig(metricName);
  const displayName = config?.displayName || metricName;
  const unit = config?.unit || '';

  // Calculate change
  const changeValue = currentValue - previousValue;
  const changePercentage = previousValue !== 0 ? (changeValue / previousValue) * 100 : 0;

  // Determine direction
  let changeDirection: 'up' | 'down' | 'stable';
  const STABLE_THRESHOLD = 2; // < 2% change is considered stable

  if (Math.abs(changePercentage) < STABLE_THRESHOLD) {
    changeDirection = 'stable';
  } else if (changeValue > 0) {
    changeDirection = 'up';
  } else {
    changeDirection = 'down';
  }

  // Get alert levels
  const currentAlert = getMetricAlert(metricName, currentValue);
  const previousAlert = getMetricAlert(metricName, previousValue);

  // Determine trend status
  const trendStatus = determineTrendStatus(
    metricName,
    changeDirection,
    currentAlert.level,
    previousAlert.level
  );

  // Determine severity
  let severity: 'good' | 'bad' | 'neutral';
  if (trendStatus === 'improved') {
    severity = 'good';
  } else if (trendStatus === 'worsened') {
    severity = 'bad';
  } else {
    severity = 'neutral';
  }

  // Generate interpretation
  const interpretation = generateInterpretation(
    displayName,
    changePercentage,
    trendStatus,
    currentAlert.level
  );

  return {
    metricName,
    displayName,
    unit,
    currentValue,
    previousValue,
    changeValue,
    changePercentage,
    changeDirection,
    trendStatus,
    severity,
    currentAlert,
    previousAlert,
    alertLevelChanged: currentAlert.level !== previousAlert.level,
    interpretation
  };
}

/**
 * Calculate changes for all metrics in panels
 */
export function calculateAllMetricChanges(
  currentMetrics: Record<string, { value: number | string; unit: string }>,
  previousMetrics: Record<string, { value: number | string; unit: string }>
): MetricChange[] {
  const changes: MetricChange[] = [];

  // Iterate through current metrics
  Object.keys(currentMetrics).forEach(metricKey => {
    const currentMetric = currentMetrics[metricKey];
    const previousMetric = previousMetrics[metricKey];

    // Skip if no previous value or non-numeric
    if (!previousMetric) return;

    const currentValue = typeof currentMetric.value === 'string'
      ? parseFloat(currentMetric.value)
      : currentMetric.value;

    const previousValue = typeof previousMetric.value === 'string'
      ? parseFloat(previousMetric.value)
      : previousMetric.value;

    // Skip if not valid numbers
    if (isNaN(currentValue) || isNaN(previousValue)) return;

    // Skip binary metrics (ANA, hematuria) - handle separately
    if (metricKey === 'ana' || metricKey === 'hematuria') {
      // TODO: Handle binary metrics separately if needed
      return;
    }

    // Calculate change
    const change = calculateMetricChange(metricKey, currentValue, previousValue);
    changes.push(change);
  });

  return changes;
}

/**
 * Get summary statistics from metric changes
 */
export function getChangesSummary(changes: MetricChange[]) {
  const improved = changes.filter(c => c.trendStatus === 'improved');
  const worsened = changes.filter(c => c.trendStatus === 'worsened');
  const stable = changes.filter(c => c.trendStatus === 'stable');

  const critical = changes.filter(c => c.currentAlert.level === 'CRITICAL');
  const danger = changes.filter(c => c.currentAlert.level === 'DANGER');
  const warning = changes.filter(c => c.currentAlert.level === 'WARNING');
  const normal = changes.filter(c => c.currentAlert.level === 'NORMAL');

  return {
    total: changes.length,
    improved: improved.length,
    worsened: worsened.length,
    stable: stable.length,
    critical: critical.length,
    danger: danger.length,
    warning: warning.length,
    normal: normal.length,
    improvedList: improved,
    worsenedList: worsened,
    stableList: stable
  };
}

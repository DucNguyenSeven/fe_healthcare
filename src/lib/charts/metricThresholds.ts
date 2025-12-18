/**
 * Metric Thresholds for Health Metrics Charts
 * Defines reference areas and alert zones for each metric
 */

export interface MetricThreshold {
  metricName: string;
  displayName: string;
  unit: string;
  zones: {
    level: 'CRITICAL' | 'DANGER' | 'WARNING' | 'NORMAL';
    min?: number;
    max?: number;
    color: string;
    fillColor: string;
    label: string;
  }[];
}

/**
 * Get threshold configuration for a specific metric
 */
export function getMetricThreshold(metricName: string): MetricThreshold | null {
  const normalized = metricName.toLowerCase();

  // eGFR (Estimated Glomerular Filtration Rate)
  if (normalized.includes('gfr') || normalized === 'egfr') {
    return {
      metricName: 'gfr',
      displayName: 'eGFR',
      unit: 'mL/min/1.73m²',
      zones: [
        {
          level: 'CRITICAL',
          min: 0,
          max: 30,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.1)',
          label: 'Rất nguy hiểm'
        },
        {
          level: 'DANGER',
          min: 30,
          max: 60,
          color: '#f97316',
          fillColor: 'rgba(249, 115, 22, 0.1)',
          label: 'Nguy hiểm'
        },
        {
          level: 'WARNING',
          min: 60,
          max: 90,
          color: '#f59e0b',
          fillColor: 'rgba(245, 158, 11, 0.1)',
          label: 'Cảnh báo'
        },
        {
          level: 'NORMAL',
          min: 90,
          max: 150,
          color: '#10b981',
          fillColor: 'rgba(16, 185, 129, 0.1)',
          label: 'Bình thường'
        }
      ]
    };
  }

  // Creatinine (Serum Creatinine)
  if (normalized.includes('creatinine')) {
    return {
      metricName: 'serum_creatinine',
      displayName: 'Creatinine',
      unit: 'mg/dL',
      zones: [
        {
          level: 'NORMAL',
          min: 0,
          max: 1.3,
          color: '#10b981',
          fillColor: 'rgba(16, 185, 129, 0.1)',
          label: 'Bình thường'
        },
        {
          level: 'WARNING',
          min: 1.3,
          max: 2.0,
          color: '#f59e0b',
          fillColor: 'rgba(245, 158, 11, 0.1)',
          label: 'Cảnh báo'
        },
        {
          level: 'DANGER',
          min: 2.0,
          max: 4.0,
          color: '#f97316',
          fillColor: 'rgba(249, 115, 22, 0.1)',
          label: 'Nguy hiểm'
        },
        {
          level: 'CRITICAL',
          min: 4.0,
          max: 10,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.1)',
          label: 'Rất nguy hiểm'
        }
      ]
    };
  }

  // BUN (Blood Urea Nitrogen)
  if (normalized.includes('bun') || normalized.includes('ure')) {
    return {
      metricName: 'bun',
      displayName: 'BUN',
      unit: 'mg/dL',
      zones: [
        {
          level: 'NORMAL',
          min: 7,
          max: 20,
          color: '#10b981',
          fillColor: 'rgba(16, 185, 129, 0.1)',
          label: 'Bình thường'
        },
        {
          level: 'WARNING',
          min: 20,
          max: 30,
          color: '#f59e0b',
          fillColor: 'rgba(245, 158, 11, 0.1)',
          label: 'Cảnh báo'
        },
        {
          level: 'DANGER',
          min: 30,
          max: 50,
          color: '#f97316',
          fillColor: 'rgba(249, 115, 22, 0.1)',
          label: 'Nguy hiểm'
        },
        {
          level: 'CRITICAL',
          min: 50,
          max: 100,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.1)',
          label: 'Rất nguy hiểm'
        }
      ]
    };
  }

  // Calcium (Serum Calcium)
  if (normalized.includes('calcium') || normalized.includes('canxi')) {
    return {
      metricName: 'serum_calcium',
      displayName: 'Canxi',
      unit: 'mg/dL',
      zones: [
        {
          level: 'CRITICAL',
          min: 0,
          max: 7.0,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.1)',
          label: 'Rất thấp'
        },
        {
          level: 'DANGER',
          min: 7.0,
          max: 8.0,
          color: '#f97316',
          fillColor: 'rgba(249, 115, 22, 0.1)',
          label: 'Thấp'
        },
        {
          level: 'WARNING',
          min: 8.0,
          max: 8.5,
          color: '#f59e0b',
          fillColor: 'rgba(245, 158, 11, 0.1)',
          label: 'Hơi thấp'
        },
        {
          level: 'NORMAL',
          min: 8.5,
          max: 10.5,
          color: '#10b981',
          fillColor: 'rgba(16, 185, 129, 0.1)',
          label: 'Bình thường'
        },
        {
          level: 'WARNING',
          min: 10.5,
          max: 11.0,
          color: '#f59e0b',
          fillColor: 'rgba(245, 158, 11, 0.1)',
          label: 'Hơi cao'
        },
        {
          level: 'DANGER',
          min: 11.0,
          max: 12.0,
          color: '#f97316',
          fillColor: 'rgba(249, 115, 22, 0.1)',
          label: 'Cao'
        },
        {
          level: 'CRITICAL',
          min: 12.0,
          max: 20,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.1)',
          label: 'Rất cao'
        }
      ]
    };
  }

  // Blood Pressure (Systolic)
  if (normalized.includes('blood_pressure') || normalized.includes('huyết áp')) {
    return {
      metricName: 'blood_pressure',
      displayName: 'Huyết áp tâm thu',
      unit: 'mmHg',
      zones: [
        {
          level: 'NORMAL',
          min: 90,
          max: 120,
          color: '#10b981',
          fillColor: 'rgba(16, 185, 129, 0.1)',
          label: 'Bình thường'
        },
        {
          level: 'WARNING',
          min: 120,
          max: 140,
          color: '#f59e0b',
          fillColor: 'rgba(245, 158, 11, 0.1)',
          label: 'Tăng nhẹ'
        },
        {
          level: 'DANGER',
          min: 140,
          max: 180,
          color: '#f97316',
          fillColor: 'rgba(249, 115, 22, 0.1)',
          label: 'Tăng cao'
        },
        {
          level: 'CRITICAL',
          min: 180,
          max: 250,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.1)',
          label: 'Nguy cấp'
        }
      ]
    };
  }

  // Default: No specific thresholds
  return null;
}

/**
 * Metric display configurations for charts
 */
export const METRIC_CONFIGS = {
  gfr: {
    displayName: 'eGFR',
    shortName: 'eGFR',
    unit: 'mL/min/1.73m²',
    color: '#3b82f6', // blue-500
    description: 'Chức năng thận',
    apiKey: 'gfr'
  },
  serum_creatinine: {
    displayName: 'Creatinine',
    shortName: 'Creat',
    unit: 'mg/dL',
    color: '#ef4444', // red-500
    description: 'Chỉ số thận',
    apiKey: 'serum_creatinine'
  },
  bun: {
    displayName: 'BUN',
    shortName: 'BUN',
    unit: 'mg/dL',
    color: '#f97316', // orange-500
    description: 'Nitơ ure máu',
    apiKey: 'bun'
  },
  serum_calcium: {
    displayName: 'Canxi',
    shortName: 'Ca',
    unit: 'mg/dL',
    color: '#a855f7', // purple-500
    description: 'Canxi máu',
    apiKey: 'serum_calcium'
  },
  ana: {
    displayName: 'ANA',
    shortName: 'ANA',
    unit: '',
    color: '#ec4899', // pink-500
    description: 'Kháng thể kháng nhân',
    apiKey: 'ana'
  },
  c3_c4: {
    displayName: 'Bổ thể C3/C4',
    shortName: 'C3/C4',
    unit: 'mg/dL',
    color: '#14b8a6', // teal-500
    description: 'Bổ thể',
    apiKey: 'c3_c4'
  },
  hematuria: {
    displayName: 'Đái máu',
    shortName: 'RBC',
    unit: '',
    color: '#f59e0b', // amber-500
    description: 'Hồng cầu trong nước tiểu',
    apiKey: 'hematuria'
  },
  oxalate_levels: {
    displayName: 'Nồng độ Oxalat',
    shortName: 'Oxalat',
    unit: 'mg/ngày',
    color: '#6366f1', // indigo-500
    description: 'Oxalat niệu',
    apiKey: 'oxalate_levels'
  },
  urine_ph: {
    displayName: 'pH nước tiểu',
    shortName: 'pH',
    unit: '',
    color: '#84cc16', // lime-500
    description: 'Độ pH',
    apiKey: 'urine_ph'
  }
} as const;

/**
 * Get metric configuration by key
 */
export function getMetricConfig(metricKey: string) {
  return METRIC_CONFIGS[metricKey as keyof typeof METRIC_CONFIGS] || null;
}

/**
 * Get all available metric keys
 */
export function getAllMetricKeys(): string[] {
  return Object.keys(METRIC_CONFIGS);
}

/**
 * Priority metrics for kidney disease (shown by default)
 */
export const PRIORITY_METRICS = ['gfr', 'serum_creatinine', 'bun', 'serum_calcium'];

/**
 * Check if a metric is a priority metric
 */
export function isPriorityMetric(metricKey: string): boolean {
  return PRIORITY_METRICS.includes(metricKey);
}

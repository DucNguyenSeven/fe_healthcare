import { useQuery } from '@tanstack/react-query';
import { HealthMetricsApi } from '@/lib/api/health-metrics';
import type { HealthMetricWithComparison } from '@/types/dashboard';
import {
  getEGFRAlert,
  getCreatinineAlert,
  getBUNAlert,
  getCalciumAlert,
  getMetricNormalRange
} from '@/types/dashboard';

/**
 * Chuyển đổi tên metric từ database field names sang display names
 */
function getDisplayName(metricName: string): string {
  const mapping: Record<string, string> = {
    // Database field names
    'gfr': 'eGFR',
    'serum_creatinine': 'Creatinine huyết thanh',
    'bun': 'Ure máu (BUN)',
    'serum_calcium': 'Canxi huyết thanh',
    // Standard names
    'eGFR': 'eGFR',
    'Creatinine': 'Creatinine huyết thanh',
    'BUN': 'Ure máu (BUN)',
    'Canxi máu': 'Canxi huyết thanh'
  };
  return mapping[metricName] || metricName;
}

/**
 * Lấy mô tả ngắn cho từng chỉ số
 */
function getMetricDescription(metricName: string): string {
  const normalized = metricName.toLowerCase();

  if (normalized.includes('egfr') || normalized === 'gfr') {
    return 'Chức năng thận';
  }
  if (normalized.includes('creatinine')) {
    return 'Chỉ số thận';
  }
  if (normalized.includes('bun') || normalized.includes('ure')) {
    return 'Nitơ ure máu';
  }
  if (normalized.includes('canxi') || normalized.includes('calcium')) {
    return 'Canxi máu';
  }
  return '';
}

/**
 * Tính alert cho từng loại metric
 */
function calculateAlert(metricName: string, value: number) {
  const normalized = metricName.toLowerCase();

  if (normalized.includes('egfr') || normalized === 'gfr') {
    return getEGFRAlert(value);
  }

  if (normalized.includes('creatinine') || normalized === 'serum_creatinine') {
    return getCreatinineAlert(value);
  }

  if (normalized.includes('bun') || normalized.includes('ure')) {
    return getBUNAlert(value);
  }

  if (normalized.includes('canxi') || normalized.includes('calcium')) {
    return getCalciumAlert(value);
  }

  // Default
  return {
    level: 'NORMAL' as const,
    label: 'Bình thường',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500'
  };
}

/**
 * Tính % vượt ngưỡng so với mức bình thường
 */
function calculateExceedance(
  metricName: string,
  currentValue: number,
  normalRange: { min?: number; max?: number; description: string }
): {
  percentage?: number;
  status: 'over' | 'under' | 'normal';
  message: string;
} {
  const normalized = metricName.toLowerCase();

  // eGFR: ≥90 = bình thường
  if (normalized.includes('egfr') || normalized === 'gfr') {
    if (currentValue >= 90) {
      return { status: 'normal', message: 'Trong mức bình thường' };
    }
    const percentage = ((90 - currentValue) / 90) * 100;
    return {
      percentage,
      status: 'under',
      message: `Thấp hơn mức bình thường ${percentage.toFixed(1)}%`
    };
  }

  // Creatinine: ≤1.3 = bình thường
  if (normalized.includes('creatinine') || normalized === 'serum_creatinine') {
    if (currentValue <= 1.3) {
      return { status: 'normal', message: 'Trong mức bình thường' };
    }
    const percentage = ((currentValue - 1.3) / 1.3) * 100;
    return {
      percentage,
      status: 'over',
      message: `Vượt mức bình thường ${percentage.toFixed(1)}%`
    };
  }

  // BUN: 7-20 = bình thường
  if (normalized.includes('bun') || normalized.includes('ure')) {
    if (currentValue >= 7 && currentValue <= 20) {
      return { status: 'normal', message: 'Trong mức bình thường' };
    }
    if (currentValue < 7) {
      const percentage = ((7 - currentValue) / 7) * 100;
      return {
        percentage,
        status: 'under',
        message: `Thấp hơn mức bình thường ${percentage.toFixed(1)}%`
      };
    }
    const percentage = ((currentValue - 20) / 20) * 100;
    return {
      percentage,
      status: 'over',
      message: `Vượt mức bình thường ${percentage.toFixed(1)}%`
    };
  }

  // Canxi: 8.5-10.5 = bình thường
  if (normalized.includes('canxi') || normalized.includes('calcium')) {
    if (currentValue >= 8.5 && currentValue <= 10.5) {
      return { status: 'normal', message: 'Trong mức bình thường' };
    }
    if (currentValue < 8.5) {
      const percentage = ((8.5 - currentValue) / 8.5) * 100;
      return {
        percentage,
        status: 'under',
        message: `Thấp hơn mức bình thường ${percentage.toFixed(1)}%`
      };
    }
    const percentage = ((currentValue - 10.5) / 10.5) * 100;
    return {
      percentage,
      status: 'over',
      message: `Vượt mức bình thường ${percentage.toFixed(1)}%`
    };
  }

  return { status: 'normal', message: 'Trong mức bình thường' };
}

/**
 * Xác định xu hướng tốt/xấu dựa trên loại chỉ số
 * @param metricName - Tên chỉ số
 * @param changeDirection - Hướng thay đổi ('up' | 'down' | 'stable')
 * @param currentValue - Giá trị hiện tại
 * @param previousValue - Giá trị tháng trước
 */
function determineTrendQuality(
  metricName: string,
  changeDirection: 'up' | 'down' | 'stable',
  currentValue: number,
  previousValue?: number
): boolean {
  if (changeDirection === 'stable') return true; // Ổn định = tốt

  const normalized = metricName.toLowerCase();

  // eGFR: Tăng = tốt, Giảm = xấu
  if (normalized.includes('egfr') || normalized === 'gfr') {
    return changeDirection === 'up';
  }

  // Creatinine: Giảm = tốt, Tăng = xấu
  if (normalized.includes('creatinine')) {
    return changeDirection === 'down';
  }

  // BUN: Giảm = tốt, Tăng = xấu
  if (normalized.includes('bun') || normalized.includes('ure')) {
    return changeDirection === 'down';
  }

  // Canxi: Phức tạp hơn - cần ở trong khoảng 8.5-10.5
  if (normalized.includes('canxi') || normalized.includes('calcium')) {
    const normalMin = 8.5;
    const normalMax = 10.5;

    // Nếu đang trong vùng an toàn
    if (currentValue >= normalMin && currentValue <= normalMax) {
      // Nếu từ ngoài vùng an toàn vào trong = tốt
      if (previousValue && (previousValue < normalMin || previousValue > normalMax)) {
        return true;
      }
      // Nếu đã ở trong và vẫn trong = ổn định tốt
      return true;
    }

    // Nếu đang ngoài vùng an toàn
    if (currentValue < normalMin) {
      // Đang thấp, tăng lên = tốt
      return changeDirection === 'up';
    }
    if (currentValue > normalMax) {
      // Đang cao, giảm xuống = tốt
      return changeDirection === 'down';
    }
  }

  // Mặc định: Ổn định hoặc cải thiện = tốt
  return changeDirection === 'stable' || changeDirection === 'down';
}

/**
 * Hook để lấy và so sánh chỉ số sức khỏe giữa 2 tháng gần nhất
 * Sử dụng API getPanelsByPatient để lấy lịch sử
 */
export function useHealthMetricsComparison(patientId: string | undefined) {
  console.log('🔍 useHealthMetricsComparison called:', { patientId, enabled: !!patientId });

  return useQuery({
    queryKey: ['health-metrics', 'comparison', patientId],
    queryFn: async () => {
      console.log('🔍 Fetching health metrics comparison for patientId:', patientId);

      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      // Lấy tất cả panels từ API
      const response = await HealthMetricsApi.getPanelsByPatient({ patientId });

      console.log('🔍 API getPanelsByPatient Response:', response);

      // Extract data từ response
      const panels: any[] = (response as any)?.data ?? (response as any) ?? [];

      console.log('🔍 Extracted panels:', panels);

      if (!Array.isArray(panels) || panels.length === 0) {
        console.warn('⚠️ No panels found');
        return [];
      }

      // Sắp xếp panels theo thời gian (mới nhất trước)
      const sortedPanels = [...panels].sort((a, b) => {
        const dateA = new Date(a.measuredAt).getTime();
        const dateB = new Date(b.measuredAt).getTime();
        return dateB - dateA; // Descending (mới nhất trước)
      });

      console.log('🔍 Sorted panels (latest first):', sortedPanels.map(p => ({
        date: p.measuredAt,
        metricsCount: p.metrics?.length
      })));

      // Lấy 2 panels gần nhất
      const latestPanel = sortedPanels[0];
      const previousPanel = sortedPanels.length > 1 ? sortedPanels[1] : null;

      console.log('🔍 Latest panel:', latestPanel);
      console.log('🔍 Previous panel:', previousPanel);

      // Normalize metrics từ panel thành object { name: {value, unit} }
      const normalizeMetrics = (panel: any) => {
        if (!panel || !panel.metrics) return {};

        return panel.metrics.reduce((acc: any, metric: any) => {
          acc[metric.name.toLowerCase()] = {
            value: metric.value,
            unit: metric.unit
          };
          return acc;
        }, {});
      };

      const currentMetrics = normalizeMetrics(latestPanel);
      const previousMetrics = previousPanel ? normalizeMetrics(previousPanel) : {};

      console.log('🔍 Current metrics:', currentMetrics);
      console.log('🔍 Previous metrics:', previousMetrics);

      // Ưu tiên 4 chỉ số: eGFR, Creatinine, BUN, Canxi
      const priorityMetrics = [
        { key: 'gfr', altKeys: ['egfr'] },
        { key: 'serum_creatinine', altKeys: ['creatinine'] },
        { key: 'bun', altKeys: ['ure máu'] },
        { key: 'serum_calcium', altKeys: ['canxi máu', 'calcium'] }
      ];

      const results: HealthMetricWithComparison[] = [];

      for (const { key, altKeys } of priorityMetrics) {
        // Tìm metric trong current panel
        let metricData = currentMetrics[key];
        let foundKey = key;

        // Thử các tên thay thế
        if (!metricData) {
          for (const altKey of altKeys) {
            if (currentMetrics[altKey]) {
              metricData = currentMetrics[altKey];
              foundKey = altKey;
              break;
            }
          }
        }

        if (!metricData) {
          console.log(`⚠️ Metric ${key} not found in current panel`);
          continue;
        }

        const currentValue = Number(metricData.value);
        const unit = metricData.unit;

        // Tìm giá trị tháng trước
        let previousValue: number | undefined;
        let previousDate: string | undefined;

        if (previousPanel) {
          let prevMetricData = previousMetrics[key];

          // Thử các tên thay thế cho previous panel
          if (!prevMetricData) {
            for (const altKey of altKeys) {
              if (previousMetrics[altKey]) {
                prevMetricData = previousMetrics[altKey];
                break;
              }
            }
          }

          if (prevMetricData) {
            previousValue = Number(prevMetricData.value);
            previousDate = previousPanel.measuredAt;
          }
        }

        // Tính toán % thay đổi và direction
        let changePercentage: number | undefined;
        let changeDirection: 'up' | 'down' | 'stable';

        if (previousValue !== undefined && previousValue !== 0) {
          changePercentage = ((currentValue - previousValue) / previousValue) * 100;

          // Xác định direction (threshold 2% để tránh nhiễu)
          if (Math.abs(changePercentage) < 2) {
            changeDirection = 'stable';
          } else if (changePercentage > 0) {
            changeDirection = 'up';
          } else {
            changeDirection = 'down';
          }
        } else {
          changeDirection = 'stable';
        }

        // Xác định xu hướng tốt/xấu
        const isTrendGood = determineTrendQuality(
          foundKey,
          changeDirection,
          currentValue,
          previousValue
        );

        // Build metric object
        const displayName = getDisplayName(foundKey);
        const alert = calculateAlert(foundKey, currentValue);
        const normalRange = getMetricNormalRange(foundKey);

        // THÊM MỚI: Tính % vượt ngưỡng so với mức bình thường
        const exceedance = calculateExceedance(foundKey, currentValue, normalRange);

        const metric: HealthMetricWithComparison = {
          metricId: `${latestPanel.id || 'latest'}-${foundKey}`,
          patientId: patientId,
          metricName: foundKey,
          metricValue: currentValue,
          unit: unit,
          measuredAt: latestPanel.measuredAt,
          displayName: displayName,
          alert: alert,
          formattedValue: `${currentValue} ${unit}`,

          // Comparison data with previous month
          previousMonthValue: previousValue,
          previousMonthDate: previousDate,
          changePercentage: changePercentage,
          changeDirection: changeDirection,
          isTrendGood: isTrendGood,

          // Normal range and exceedance data
          normalRange: normalRange,
          exceedancePercentage: exceedance.percentage,
          exceedanceStatus: exceedance.status,
          exceedanceMessage: exceedance.message
        };

        results.push(metric);
      }

      console.log('🔍 Final comparison results:', results.map(m => ({
        name: m.displayName,
        current: m.metricValue,
        previous: m.previousMonthValue,
        change: m.changePercentage,
        trend: m.changeDirection,
        good: m.isTrendGood
      })));

      return results;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 2
  });
}

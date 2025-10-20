import { useQuery } from '@tanstack/react-query';
import { HealthMetricsApi } from '@/lib/api/health-metrics';
import type {
  HealthMetricLatest,
  HealthMetricResponse,
  MetricAlert
} from '@/types/dashboard';
import {
  getEGFRAlert,
  getCreatinineAlert,
  getBloodPressureAlert
} from '@/types/dashboard';

/**
 * Chuyển đổi tên metric từ tiếng Anh sang tiếng Việt
 * Map cả database field names (gfr, serum_creatinine) và display names
 */
function getDisplayName(metricName: string): string {
  const mapping: Record<string, string> = {
    // Database field names → Display names
    'gfr': 'eGFR',
    'serum_creatinine': 'Creatinine',
    'blood_pressure': 'Huyết áp',
    'weight': 'Cân nặng',
    'bun': 'BUN',
    'ana': 'ANA',
    'c3_c4': 'C3/C4',
    'hematuria': 'Hematuria',
    'oxalate_levels': 'Oxalate',
    'urine_ph': 'pH nước tiểu',
    'serum_calcium': 'Canxi máu',
    // Standard names (case-insensitive fallback)
    'eGFR': 'eGFR',
    'Creatinine': 'Creatinine',
    'Blood Pressure': 'Huyết áp',
    'Weight': 'Cân nặng',
    'Hemoglobin': 'Hemoglobin',
    'Albumin': 'Albumin',
    'Potassium': 'Kali',
    'Sodium': 'Natri'
  };
  return mapping[metricName] || metricName;
}

/**
 * Format giá trị hiển thị
 * VD: Blood Pressure: "140/90" -> "140/90 mmHg"
 */
function formatMetricValue(metric: HealthMetricResponse): string {
  if (metric.metricName === 'Blood Pressure') {
    // Giá trị đã được format sẵn từ API (VD: "140/90")
    return `${metric.metricValue} ${metric.unit}`;
  }
  return `${metric.metricValue} ${metric.unit}`;
}

/**
 * Tính toán alert cho từng loại metric
 * Support both database names (gfr, serum_creatinine) and display names
 */
function calculateAlert(metric: HealthMetricResponse): MetricAlert {
  const metricName = metric.metricName.toLowerCase();

  // eGFR / GFR
  if (metricName === 'egfr' || metricName === 'gfr') {
    return getEGFRAlert(Number(metric.metricValue));
  }

  // Creatinine
  if (metricName === 'creatinine' || metricName === 'serum_creatinine') {
    return getCreatinineAlert(Number(metric.metricValue));
  }

  // Blood Pressure
  if (metricName === 'blood pressure' || metricName === 'blood_pressure') {
    // Lấy giá trị tâm thu (systolic - số đầu tiên)
    const valueStr = String(metric.metricValue);
    const systolic = valueStr.includes('/')
      ? Number(valueStr.split('/')[0])
      : Number(metric.metricValue);
    return getBloodPressureAlert(systolic);
  }

  // Weight
  if (metricName === 'weight' || metricName === 'cân nặng') {
    return {
      level: 'NORMAL',
      label: 'Bình thường',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    };
  }

  // Default: Các chỉ số khác mặc định hiển thị màu xanh dương
  return {
    level: 'NORMAL',
    label: 'Bình thường',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500'
  };
}

/**
 * Transform API response thành format cho UI
 */
function transformHealthMetrics(data: HealthMetricResponse[]): HealthMetricLatest[] {
  // ✅ FIX: Add null/undefined check
  if (!data || !Array.isArray(data)) {
    console.warn('⚠️ transformHealthMetrics received invalid data:', data);
    return [];
  }

  return data.map(metric => ({
    ...metric,
    displayName: getDisplayName(metric.metricName),
    formattedValue: formatMetricValue(metric),
    alert: calculateAlert(metric)
  }));
}

/**
 * Hook để lấy chỉ số sức khỏe mới nhất với màu sắc cảnh báo
 */
export function useLatestHealthMetrics(patientId: string | undefined) {
  // 🔍 DEBUG: Log hook execution
  console.log('🔍 useLatestHealthMetrics called:', {
    patientId,
    enabled: !!patientId
  });

  return useQuery({
    queryKey: ['health-metrics', 'latest', patientId],
    queryFn: async () => {
      console.log('🔍 Fetching health metrics for patientId:', patientId);

      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      const response = await HealthMetricsApi.getLatestHealthMetrics(patientId);

      console.log('🔍 API Response (FULL):', response);
      console.log('🔍 API Response.data:', response.data);
      console.log('🔍 Type of response:', typeof response);
      console.log('🔍 Type of response.data:', typeof response.data);

      // ✅ FIX: Handle different response structures
      let rawData: HealthMetricResponse[];

      if (Array.isArray(response)) {
        // Case 1: API returns array directly
        rawData = response;
      } else if (Array.isArray(response.data)) {
        // Case 2: API returns { data: [...] }
        rawData = response.data;
      } else {
        // Case 3: Unexpected structure
        console.warn('⚠️ Unexpected API response structure:', response);
        rawData = [];
      }

      console.log('🔍 Raw Data to Transform:', rawData);
      console.log('🔍 Is Array?', Array.isArray(rawData));
      console.log('🔍 Array length:', rawData.length);

      const transformed = transformHealthMetrics(rawData);

      console.log('🔍 Transformed Data:', {
        count: transformed.length,
        metrics: transformed.map(m => ({ name: m.metricName, value: m.metricValue }))
      });

      return transformed;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 2,
    select: (data) => {
      // Ưu tiên hiển thị các chỉ số liên quan đến suy thận cho dashboard
      // Dashboard chỉ hiển thị 4 chỉ số quan trọng nhất
      const priorityOrder = [
        'eGFR',           // Quan trọng nhất
        'Creatinine',     // Quan trọng thứ 2
        'BUN',            // Ure máu
        'Canxi máu',      // Canxi huyết thanh
        'C3/C4',          // Bổ thể
        'pH nước tiểu',   // pH
        'Hematuria',      // Hồng cầu niệu
        'Oxalate'         // Oxalate
      ];

      // Filter metrics có giá trị (không null, không rỗng)
      const validMetrics = data.filter(metric =>
        metric.metricValue != null &&
        metric.metricValue !== '' &&
        metric.metricValue !== 'null'
      );

      console.log('🔍 Valid metrics after filter:', {
        total: data.length,
        valid: validMetrics.length,
        filtered: validMetrics.map(m => m.displayName)
      });

      // Sort theo thứ tự ưu tiên
      const sorted = validMetrics.sort((a, b) => {
        const indexA = priorityOrder.indexOf(a.displayName);
        const indexB = priorityOrder.indexOf(b.displayName);

        // Nếu cả hai đều trong priority list, sort theo thứ tự priority
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }

        // Nếu chỉ có một trong priority list, nó được ưu tiên
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // Nếu cả hai đều không trong priority list, giữ nguyên thứ tự
        return 0;
      });

      // Chỉ lấy top 4 cho dashboard
      const topMetrics = sorted.slice(0, 4);

      console.log('🔍 Top 4 metrics for dashboard:',
        topMetrics.map(m => ({ name: m.displayName, value: m.metricValue }))
      );

      return topMetrics;
    }
  });
}

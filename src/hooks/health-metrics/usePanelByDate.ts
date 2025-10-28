"use client";

import { useQuery } from '@tanstack/react-query';
import { HealthMetricsApi } from '@/lib/api/health-metrics';

export interface HealthMetricPanelRow {
  id: string;
  measuredAt: string;
  metrics: Record<string, { value: number | string; unit: string }>;
}

/**
 * Hook để lấy health metrics panel theo ngày cụ thể
 * Gọi API: GET /api/v1/health-metrics/by-patient-and-date
 */
export function usePanelByDate(patientId?: string, measuredAt?: string | null) {
  return useQuery({
    queryKey: ['health-metrics', 'by-date', patientId, measuredAt],
    queryFn: async () => {
      if (!patientId || !measuredAt) {
        throw new Error('Patient ID and measured date are required');
      }

      console.log('🔍 [usePanelByDate] Fetching panel for:', { patientId, measuredAt });

      const response = await HealthMetricsApi.getPanelsByPatientAndDate({
        patientId,
        measuredAt
      });

      console.log('🔍 [usePanelByDate] Response:', response);

      const payload: any = (response as any)?.data ?? response as any;
      
      if (!payload || !Array.isArray(payload) || payload.length === 0) {
        console.warn('⚠️ [usePanelByDate] No data found for date:', measuredAt);
        return null;
      }

      // Normalize panel data
      const panel = payload[0]; // API returns array but should have only 1 item for specific date
      const normalized: HealthMetricPanelRow = {
        id: panel.id || measuredAt,
        measuredAt: panel.measuredAt,
        metrics: (panel.metrics || []).reduce((acc: any, m: any) => {
          acc[m.name.toLowerCase()] = { value: m.value, unit: m.unit };
          return acc;
        }, {} as Record<string, { value: number | string; unit: string }>),
      };

      console.log('🔍 [usePanelByDate] Normalized panel:', normalized);

      return normalized;
    },
    enabled: !!patientId && !!measuredAt,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}


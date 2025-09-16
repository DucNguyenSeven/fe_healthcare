"use client";

import { useCallback, useEffect, useState } from 'react';
import { HealthMetricsApi } from '@/lib/api/health-metrics';

export interface HealthMetricPanelRow {
  id: string;
  measuredAt: string; // ISO
  metrics: Record<string, { value: number | string; unit: string }>;
}

export function usePatientHealthPanels(patientId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panels, setPanels] = useState<HealthMetricPanelRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPanels = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await HealthMetricsApi.getPanelsByPatient({ patientId });
      const payload: any = (res as any)?.data ?? res as any;
      if (!payload) throw new Error(((res as any)?.message) || 'Không thể tải dữ liệu');
      const normalized = (payload || []).map((p: any, idx: number) => ({
        id: p.id || String(idx),
        measuredAt: p.measuredAt,
        metrics: (p.metrics || []).reduce((acc: any, m: any) => {
          acc[m.name] = { value: m.value, unit: m.unit };
          return acc;
        }, {} as Record<string, { value: number | string; unit: string }>),
      })) as HealthMetricPanelRow[];
      setPanels(normalized);
      setTotalElements(normalized.length);
      setTotalPages(1);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  return { panels, loading, error, totalElements, totalPages, refetchPanels: fetchPanels };
}



